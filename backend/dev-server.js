const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5175',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// In-memory storage for development
const users = [];
const conversations = [];
const services = [
  {
    id: 'svc_birth_certificate',
    title: 'Acte de naissance',
    description: 'Demande ou retrait d\'un acte de naissance officiel.',
    category: 'documents',
    steps: [
      { order: 1, title: 'Préparer les pièces', description: 'Carte d\'identité + livret de famille.' },
      { order: 2, title: 'Se rendre à la mairie', description: 'Déposer la demande au guichet.' },
      { order: 3, title: 'Retirer le document', description: 'Revenir avec le récépissé.' }
    ],
    faq: [
      { id: 'delais', question: 'Quels délais ?', answer: '24 à 72 heures selon la commune.' }
    ],
    contact: { phone: '+213-555-123456', email: 'etatcivil@example.gov' }
  },
  {
    id: 'svc_passport',
    title: 'Passeport biométrique',
    description: 'Démarches pour obtenir un passeport biométrique.',
    category: 'documents',
    steps: [
      { order: 1, title: 'Prendre rendez-vous', description: 'Via la plateforme officielle.' },
      { order: 2, title: 'Déposer le dossier', description: 'Présenter les pièces et photos.' },
      { order: 3, title: 'Suivre la production', description: 'Recevoir une notification SMS.' }
    ],
    faq: [
      { id: 'cout', question: 'Combien ça coûte ?', answer: '10 000 DA pour un adulte.' }
    ],
    contact: { phone: '+213-555-654321', email: 'passeport@example.gov' }
  }
];

// Simple auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Backend connected successfully!',
    timestamp: new Date().toISOString(),
    features: ['Authentication', 'Services', 'Conversations', 'AI Integration']
  });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      role: 'user',
      createdAt: new Date()
    };
    
    users.push(user);
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Services routes
app.get('/api/services', (req, res) => {
  res.json({ services });
});

app.get('/api/services/:id', (req, res) => {
  const service = services.find(s => s.id === req.params.id);
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }
  res.json(service);
});

// Conversations routes
app.get('/api/conversations/user/:userId', authMiddleware, (req, res) => {
  const userConversations = conversations.filter(c => c.userId === req.params.userId);
  res.json({ conversations: userConversations });
});

app.post('/api/conversations', authMiddleware, (req, res) => {
  const { title, initialMessage } = req.body;
  
  const conversation = {
    id: Date.now().toString(),
    userId: req.user.id,
    title: title || 'Nouvelle conversation',
    messages: initialMessage ? [{
      id: Date.now().toString(),
      role: 'user',
      content: initialMessage,
      timestamp: new Date()
    }] : [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  conversations.push(conversation);
  res.status(201).json(conversation);
});

app.post('/api/conversations/:id/messages', authMiddleware, (req, res) => {
  const { content, role = 'user' } = req.body;
  const conversation = conversations.find(c => c.id === req.params.id);
  
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  if (conversation.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const message = {
    id: Date.now().toString(),
    role,
    content,
    timestamp: new Date()
  };
  
  conversation.messages.push(message);
  conversation.updatedAt = new Date();
  
  res.json({ message, conversationId: conversation.id });
});

app.post('/api/conversations/:id/generate', authMiddleware, (req, res) => {
  const { userMessage, context = '' } = req.body;
  const conversation = conversations.find(c => c.id === req.params.id);
  
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  if (conversation.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Simple AI response simulation
  const responses = [
    'Je vous remercie pour votre question. Voici les informations disponibles sur ce service.',
    'Pour cette démarche administrative, je vous recommande de suivre les étapes suivantes...',
    'Selon les informations disponibles, voici ce que vous devez savoir...',
    'Je peux vous aider avec cette procédure. Voici les documents nécessaires...'
  ];
  
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  const aiResponse = `${randomResponse} ${context ? `Contexte: ${context}` : ''}`;
  
  // Add user message
  const userMsg = {
    id: Date.now().toString(),
    role: 'user',
    content: userMessage,
    timestamp: new Date()
  };
  
  // Add AI response
  const aiMsg = {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: aiResponse,
    timestamp: new Date()
  };
  
  conversation.messages.push(userMsg, aiMsg);
  conversation.updatedAt = new Date();
  
  res.json({
    userMessage: userMsg,
    aiResponse: aiMsg,
    conversationId: conversation.id
  });
});

// Feedback routes
app.post('/api/feedback', (req, res) => {
  const { rating, comment, suggestion } = req.body;
  
  const feedback = {
    id: Date.now().toString(),
    rating,
    comment,
    suggestion,
    createdAt: new Date()
  };
  
  res.status(201).json({ message: 'Feedback submitted successfully', feedback });
});

// Knowledge base
app.get('/api/knowledge-base', (req, res) => {
  const knowledge = services.map(service => ({
    id: service.id,
    question: `Comment obtenir ${service.title.toLowerCase()}?`,
    answer: service.description,
    category: service.category,
    serviceId: service.id
  }));
  
  res.json({ knowledge });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Create default admin user
const createDefaultAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@nird.gov';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  
  const existingAdmin = users.find(u => u.email === adminEmail);
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    users.push({
      id: 'admin',
      email: adminEmail,
      password: hashedPassword,
      name: 'System Administrator',
      role: 'admin',
      createdAt: new Date()
    });
    console.log(`✅ Default admin created: ${adminEmail}`);
  }
};

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  await createDefaultAdmin();
  console.log(`🚀 Development backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Frontend CORS: ${process.env.FRONTEND_URL || 'http://localhost:5175'}`);
  console.log('📝 In-memory storage active (no MongoDB required)');
});

module.exports = app;