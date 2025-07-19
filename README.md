# 📝 étude - AI-Powered Collaborative Note-Taking App

> A beautiful and intelligent note-taking application inspired by Notion, built with modern web technologies and AI integrations.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

## 🌟 Features

### ✅ **Authentication & User Management**
- Secure user registration and login
- JWT-based authentication with Redis token blocklist
- Account deletion with cascade cleanup
- User preferences and settings

### ✅ **Workspace & Collaboration**
- Create and manage multiple workspaces
- Team collaboration with role-based permissions (editor/viewer)
- Real-time collaborative editing
- User presence indicators and live cursors

### ✅ **Notion-Like Editor**
- Block-based content editing
- Rich text formatting
- Drag & drop functionality
- Auto-save with visual indicators
- Undo/Redo system (100 action history)

### ✅ **AI-Powered Features**
- **Smart Writing**: AI text completion and improvement
- **Grammar Check**: Automatic spelling and grammar correction
- **Translation**: Multi-language AI translation
- **Title Suggestions**: AI-generated title recommendations
- **OCR**: Extract text from images
- **Calendar Sync**: Smart date extraction and calendar integration

### ✅ **Organization & Search**
- Favorites system with quick access
- Tag-based content organization
- Full-text search across all content
- List and grid view modes
- Advanced filtering options

### ✅ **Sharing & Permissions**
- Generate shareable links with read-only access
- Invite users to collaborate on pages
- Fine-grained permission control
- Public and private page settings

## 🚀 Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io for live collaboration
- **Caching**: Redis for performance optimization
- **Messaging**: RabbitMQ for background tasks
- **AI**: OpenAI GPT integration
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 14 (React 18+)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: React Hooks + Custom hooks
- **Testing**: React Testing Library + Jest
- **Build Tool**: Next.js with SWC

### DevOps & Deployment
- **Containerization**: Docker & Docker Compose
- **Process Management**: PM2
- **Monitoring**: Prometheus + Grafana
- **Logging**: ELK Stack
- **Reverse Proxy**: Nginx

## 📦 Project Structure

```
YazMuh-Proje/
├── backend/                 # Node.js API server
│   ├── controllers/        # Business logic
│   ├── models/            # Database schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Authentication & validation
│   ├── config/           # Database, Redis, Socket.io config
│   ├── __tests__/        # Backend tests
│   └── workers/          # Background job processors
├── frontend/              # Next.js React application
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and API client
│   └── __tests__/       # Frontend tests
├── docker-compose.prod.yml # Production deployment
└── docs/                 # Documentation
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or cloud)
- Redis (optional, for caching)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/YusufGokberkOluk/YazMuh-Proje.git
cd YazMuh-Proje
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB (if local)
mongod

# Start the backend server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start the frontend development server
npm run dev
```

### 4. Quick Start (Both servers)
```bash
# Windows
.\start-local-test.bat

# Or manually:
# Terminal 1: cd backend && npm run dev
# Terminal 2: cd frontend && npm run dev
```

## 🌐 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/yazmuh-proje
JWT_SECRET=your-super-secret-jwt-key
REDIS_URL=redis://localhost:6379
ENABLE_REDIS=false
ENABLE_RABBITMQ=false
OPENAI_API_KEY=your-openai-api-key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

## 🔧 API Documentation

The API is fully documented with Swagger/OpenAPI. After starting the backend server, visit:
```
http://localhost:5000/api/docs
```

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/workspaces` | List user workspaces |
| POST | `/api/pages` | Create new page |
| GET | `/api/pages/:id` | Get page content |
| POST | `/api/ai/complete-text` | AI text completion |
| POST | `/api/ai/check-grammar` | Grammar checking |
| POST | `/api/ai/translate` | Text translation |

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:coverage
```

### End-to-End Testing
```bash
# Quick API tests
.\quick-test.bat
```

## 🚀 Deployment

### Development
```bash
# Start both servers
.\start-local-test.bat
```

### Production with Docker
```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# Services included:
# - MongoDB
# - Redis
# - RabbitMQ
# - Backend API
# - Frontend (Next.js)
# - Nginx (reverse proxy)
# - Monitoring (Prometheus, Grafana)
```

## 📱 Usage

1. **Register/Login**: Create an account or sign in
2. **Create Workspace**: Set up your first workspace
3. **Create Pages**: Start writing with the block-based editor
4. **Collaborate**: Invite team members and work together in real-time
5. **Use AI Features**: Enhance your writing with AI assistance
6. **Organize**: Use tags and favorites to organize your content
7. **Share**: Share pages with others using secure links

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Team Members**: 
  - Sadettin Yiğit ÖZDEM
  - Deniz ŞAHİN
  - Yusuf Gökberk OLUK
  - Yunus Eren UYSAL
- **Inspiration**: Notion for the beautiful block-based editor concept
- **AI**: OpenAI for powering the intelligent features

## 📞 Support

If you have any questions or need help, please:
1. Check the [documentation](./docs/)
2. Search existing [issues](https://github.com/YusufGokberkOluk/YazMuh-Proje/issues)
3. Create a new issue if needed

---

**Made with ❤️ for the YazMuh course project**
