const axios = require('axios');

// AI servis konfigürasyonu
const AI_CONFIG = {
  // OpenAI API (örnek)
  openai: {
    baseURL: process.env.OPENAI_API_URL || 'https://api.openai.com/v1',
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
  },
  // Hugging Face API (örnek)
  huggingface: {
    baseURL: process.env.HUGGINGFACE_API_URL || 'https://api-inference.huggingface.co/models',
    apiKey: process.env.HUGGINGFACE_API_KEY
  }
};

// Metin tamamlama
const completeText = async (req, res) => {
  try {
    const { text, maxTokens = 100 } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Metin gereklidir'
      });
    }

    if (!AI_CONFIG.openai.apiKey) {
      return res.status(500).json({
        success: false,
        message: 'AI servisi yapılandırılmamış'
      });
    }

    const response = await axios.post(
      `${AI_CONFIG.openai.baseURL}/chat/completions`,
      {
        model: AI_CONFIG.openai.model,
        messages: [
          {
            role: 'user',
            content: `Aşağıdaki metni tamamla: ${text}`
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const completion = response.data.choices[0].message.content;

    res.json({
      success: true,
      data: {
        originalText: text,
        completion: completion,
        fullText: text + completion
      },
      message: 'Metin başarıyla tamamlandı'
    });
  } catch (error) {
    console.error('Metin tamamlama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Metin tamamlanamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Dilbilgisi kontrolü
const checkGrammar = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Metin gereklidir'
      });
    }

    if (!AI_CONFIG.openai.apiKey) {
      return res.status(500).json({
        success: false,
        message: 'AI servisi yapılandırılmamış'
      });
    }

    const response = await axios.post(
      `${AI_CONFIG.openai.baseURL}/chat/completions`,
      {
        model: AI_CONFIG.openai.model,
        messages: [
          {
            role: 'user',
            content: `Aşağıdaki metni dilbilgisi açısından kontrol et ve düzeltilmiş halini ver. Hataları da listele: ${text}`
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = response.data.choices[0].message.content;

    res.json({
      success: true,
      data: {
        originalText: text,
        correctedText: result
      },
      message: 'Dilbilgisi kontrolü tamamlandı'
    });
  } catch (error) {
    console.error('Dilbilgisi kontrolü hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Dilbilgisi kontrolü yapılamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Çeviri
const translate = async (req, res) => {
  try {
    const { text, targetLanguage = 'English' } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Metin gereklidir'
      });
    }

    if (!AI_CONFIG.openai.apiKey) {
      return res.status(500).json({
        success: false,
        message: 'AI servisi yapılandırılmamış'
      });
    }

    const response = await axios.post(
      `${AI_CONFIG.openai.baseURL}/chat/completions`,
      {
        model: AI_CONFIG.openai.model,
        messages: [
          {
            role: 'user',
            content: `Aşağıdaki metni ${targetLanguage} diline çevir: ${text}`
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const translation = response.data.choices[0].message.content;

    res.json({
      success: true,
      data: {
        originalText: text,
        translatedText: translation,
        targetLanguage: targetLanguage
      },
      message: 'Çeviri tamamlandı'
    });
  } catch (error) {
    console.error('Çeviri hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Çeviri yapılamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Başlık önerisi
const suggestTitle = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'İçerik gereklidir'
      });
    }

    if (!AI_CONFIG.openai.apiKey) {
      return res.status(500).json({
        success: false,
        message: 'AI servisi yapılandırılmamış'
      });
    }

    const response = await axios.post(
      `${AI_CONFIG.openai.baseURL}/chat/completions`,
      {
        model: AI_CONFIG.openai.model,
        messages: [
          {
            role: 'user',
            content: `Aşağıdaki içerik için 3 farklı başlık önerisi ver. Başlıklar kısa ve açıklayıcı olsun: ${content}`
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const suggestions = response.data.choices[0].message.content;

    res.json({
      success: true,
      data: {
        content: content,
        titleSuggestions: suggestions
      },
      message: 'Başlık önerileri oluşturuldu'
    });
  } catch (error) {
    console.error('Başlık önerisi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Başlık önerisi oluşturulamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// OCR (Optical Character Recognition)
const ocr = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Görsel URL\'i gereklidir'
      });
    }

    if (!AI_CONFIG.openai.apiKey) {
      return res.status(500).json({
        success: false,
        message: 'AI servisi yapılandırılmamış'
      });
    }

    // OpenAI Vision API kullanarak OCR
    const response = await axios.post(
      `${AI_CONFIG.openai.baseURL}/chat/completions`,
      {
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Bu görseldeki metni oku ve düz metin olarak ver.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const extractedText = response.data.choices[0].message.content;

    res.json({
      success: true,
      data: {
        imageUrl: imageUrl,
        extractedText: extractedText
      },
      message: 'OCR işlemi tamamlandı'
    });
  } catch (error) {
    console.error('OCR hatası:', error);
    res.status(500).json({
      success: false,
      message: 'OCR işlemi yapılamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Takvim senkronizasyonu
const calendarSync = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'İçerik gereklidir'
      });
    }

    if (!AI_CONFIG.openai.apiKey) {
      return res.status(500).json({
        success: false,
        message: 'AI servisi yapılandırılmamış'
      });
    }

    const response = await axios.post(
      `${AI_CONFIG.openai.baseURL}/chat/completions`,
      {
        model: AI_CONFIG.openai.model,
        messages: [
          {
            role: 'user',
            content: `Aşağıdaki metinden tarihleri, saatleri ve etkinlikleri çıkar. JSON formatında döndür: ${content}`
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${AI_CONFIG.openai.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const events = response.data.choices[0].message.content;

    res.json({
      success: true,
      data: {
        content: content,
        extractedEvents: events,
        calendarData: {
          events: JSON.parse(events || '[]')
        }
      },
      message: 'Takvim etkinlikleri çıkarıldı'
    });
  } catch (error) {
    console.error('Takvim senkronizasyonu hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Takvim senkronizasyonu yapılamadı',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  completeText,
  checkGrammar,
  translate,
  suggestTitle,
  ocr,
  calendarSync
}; 