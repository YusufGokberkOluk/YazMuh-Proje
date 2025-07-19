const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../server');
const User = require('../../models/User');

// Mock OpenAI
jest.mock('axios');
const axios = require('axios');

describe('AI Controller', () => {
  let mongoServer;
  let authToken;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    
    // Create test user and get auth token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

    authToken = registerResponse.body.data.token;
    
    // Reset axios mock
    axios.post.mockClear();
  });

  describe('POST /api/ai/complete', () => {
    it('should complete text successfully', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: 'This is a completed text.'
            }
          }]
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/ai/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'This is a sample',
          context: 'creative writing'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.completedText).toBe('This is a completed text.');
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    it('should handle OpenAI API errors', async () => {
      axios.post.mockRejectedValue(new Error('OpenAI API Error'));

      const response = await request(app)
        .post('/api/ai/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'This is a sample',
          context: 'creative writing'
        })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('tamamlanamadı');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/ai/complete')
        .send({
          text: 'This is a sample',
          context: 'creative writing'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/ai/complete')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing text field
          context: 'creative writing'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('gereklidir');
    });
  });

  describe('POST /api/ai/grammar', () => {
    it('should check grammar successfully', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: JSON.stringify({
                correctedText: 'This is correct grammar.',
                suggestions: [
                  {
                    original: 'is wrong',
                    corrected: 'is correct',
                    reason: 'Grammar correction'
                  }
                ]
              })
            }
          }]
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/ai/grammar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'This is wrong grammar.'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.correctedText).toBe('This is correct grammar.');
      expect(response.body.data.suggestions).toHaveLength(1);
    });
  });

  describe('POST /api/ai/translate', () => {
    it('should translate text successfully', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: 'Bonjour le monde'
            }
          }]
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/ai/translate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'Hello world',
          targetLanguage: 'French'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.translatedText).toBe('Bonjour le monde');
    });

    it('should validate target language', async () => {
      const response = await request(app)
        .post('/api/ai/translate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'Hello world'
          // Missing targetLanguage
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('gereklidir');
    });
  });

  describe('POST /api/ai/suggest-title', () => {
    it('should suggest title successfully', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: JSON.stringify([
                'Amazing Content Title',
                'Great Content Ideas',
                'Content Strategy Guide'
              ])
            }
          }]
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/ai/suggest-title')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'This is some amazing content about strategies and ideas.'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.suggestions).toHaveLength(3);
      expect(response.body.data.suggestions[0]).toBe('Amazing Content Title');
    });
  });

  describe('POST /api/ai/calendar-sync', () => {
    it('should extract calendar events successfully', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: JSON.stringify([
                {
                  title: 'Team Meeting',
                  date: '2024-01-15',
                  time: '10:00',
                  description: 'Weekly team sync meeting'
                },
                {
                  title: 'Project Deadline',
                  date: '2024-01-20',
                  time: '17:00',
                  description: 'Project submission deadline'
                }
              ])
            }
          }]
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/ai/calendar-sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'We have a team meeting on January 15th at 10 AM and project deadline on January 20th at 5 PM.'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.events).toHaveLength(2);
      expect(response.body.data.events[0].title).toBe('Team Meeting');
      expect(response.body.data.events[1].title).toBe('Project Deadline');
    });

    it('should handle text with no events', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: JSON.stringify([])
            }
          }]
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/ai/calendar-sync')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'This is just regular text with no dates or events.'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.events).toHaveLength(0);
    });
  });

  describe('POST /api/ai/ocr', () => {
    it('should extract text from image successfully', async () => {
      const mockResponse = {
        data: {
          choices: [{
            message: {
              content: 'This is extracted text from the image.'
            }
          }]
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/api/ai/ocr')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          imageUrl: 'https://example.com/image.jpg'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.extractedText).toBe('This is extracted text from the image.');
    });

    it('should validate image URL', async () => {
      const response = await request(app)
        .post('/api/ai/ocr')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing imageUrl
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('gereklidir');
    });
  });
}); 