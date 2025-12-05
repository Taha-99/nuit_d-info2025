# Nuit d'Info 2025 - Backend API

This backend provides a complete API for managing government services, user authentication, conversations with AI assistance, and feedback collection.

## Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation
```bash
cd backend
npm install
```

### Environment Variables
Copy `.env.example` to `.env` and configure:

```bash
# MongoDB Database
MONGODB_URI=mongodb://localhost:27017/nuit_info_2025
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/nuit_info_2025

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRE=7d

# Server
PORT=4000
NODE_ENV=development

# Admin
ADMIN_EMAIL=admin@nird.gov
ADMIN_PASSWORD=ChangeMe123!

# Qwen3 Embedding 8B API
QWEN_API_KEY=your-qwen-api-key
QWEN_API_URL=https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding
QWEN_MODEL=text-embedding-v3
QWEN_EMBEDDING_DIMENSION=1024

# CORS
FRONTEND_URL=http://localhost:3000
```

### MongoDB Setup

#### Option 1: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service: `mongod`
3. Use connection string: `mongodb://localhost:27017/nuit_info_2025`

#### Option 2: MongoDB Atlas (Cloud)
1. Create free account at https://www.mongodb.com/atlas
2. Create cluster and get connection string
3. Update `MONGODB_URI_PROD` in `.env`

### Starting the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)
- `PUT /api/auth/password` - Change password (protected)

### Services
- `GET /api/services` - List all services
- `GET /api/services/categories` - Get service categories
- `GET /api/services/stats` - Get service statistics
- `GET /api/services/:id` - Get specific service
- `POST /api/services` - Create service (admin only)
- `PUT /api/services/:id` - Update service (admin only)
- `DELETE /api/services/:id` - Delete service (admin only)

### Conversations (AI Chat)
- `GET /api/conversations/user/:userId` - Get user conversations
- `GET /api/conversations/:id` - Get specific conversation
- `POST /api/conversations` - Create new conversation
- `PUT /api/conversations/:id` - Update conversation
- `DELETE /api/conversations/:id` - Delete conversation
- `POST /api/conversations/:id/messages` - Add message
- `POST /api/conversations/:id/generate` - Generate AI response
- `POST /api/conversations/search` - Search conversations

### Feedback
- `POST /api/feedback` - Submit feedback (public)
- `GET /api/feedback` - List feedback (admin only)
- `GET /api/feedback/stats` - Get feedback statistics (admin only)
- `PUT /api/feedback/:id/status` - Update feedback status (admin only)
- `DELETE /api/feedback/:id` - Delete feedback (admin only)

### Knowledge Base
- `GET /api/knowledge-base` - Get knowledge base
- `POST /api/knowledge-base/search` - Search knowledge

### Sync
- `POST /api/sync` - Sync offline data

## Features

### 🔐 User Authentication
- JWT-based authentication
- Role-based access control (user, admin, moderator)
- Secure password hashing with bcrypt
- User profile management

### 🤖 AI Integration
- Qwen3 Embedding 8B for text embeddings
- Conversation history with embeddings
- Semantic search capabilities
- AI response generation

### 📊 Government Services
- Complete service catalog
- Multi-language support (French/Arabic)
- Service statistics and analytics
- FAQ management

### 💬 Real-time Chat
- Conversation management
- Message history with metadata
- Search through conversations
- User and AI message tracking

### 📝 Feedback System
- Anonymous and authenticated feedback
- Rating system (1-5 stars)
- Feedback categorization
- Admin moderation tools

### 🔍 Knowledge Base
- Dynamic knowledge base from services
- Full-text search
- FAQ integration
- Multi-language content

## Database Schema

### Users
- Authentication and profile data
- Role management
- Preferences and statistics

### Services
- Government service information
- Steps, forms, and contact details
- Multi-language support
- View tracking and ratings

### Conversations
- Chat history between users and AI
- Message embeddings for search
- Conversation metadata and tags

### Feedback
- User feedback and ratings
- Admin responses
- Sentiment analysis data

## Security Features

- CORS configuration
- Helmet.js security headers
- Input validation with express-validator
- JWT token expiration
- Rate limiting ready
- SQL injection prevention (MongoDB)
- XSS protection

## Development

### Code Structure
```
src/
├── config/         # Database and app configuration
├── controllers/    # Route handlers
├── middleware/     # Authentication and validation
├── models/         # MongoDB schemas
├── routes/         # API route definitions
└── services/       # External API integrations
```

### Testing
```bash
npm test
```

### Deployment
1. Set `NODE_ENV=production`
2. Use production MongoDB URI
3. Configure proper CORS origins
4. Set secure JWT secret
5. Configure reverse proxy (nginx)

## Troubleshooting

### MongoDB Connection Issues
1. Ensure MongoDB is running locally or Atlas connection is correct
2. Check firewall settings
3. Verify connection string format

### Qwen API Issues
1. Verify API key is valid
2. Check API endpoint URL
3. Monitor rate limits

### Authentication Problems
1. Check JWT secret configuration
2. Verify token expiration settings
3. Ensure proper CORS setup

## License
MIT License - see LICENSE file for details