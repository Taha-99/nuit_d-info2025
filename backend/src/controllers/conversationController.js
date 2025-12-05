const Conversation = require('../models/conversationModel');
const User = require('../models/userModel');
const qwenService = require('../services/qwenService');

// Get all conversations for a user
const getUserConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, search } = req.query;

    let query = { userId, isActive: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'messages.content': { $regex: search, $options: 'i' } }
      ];
    }

    const conversations = await Conversation.find(query)
      .select('title createdAt updatedAt language tags messages')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Add messageCount to each conversation
    const conversationsWithCount = conversations.map(conv => ({
      ...conv,
      id: conv._id,
      messageCount: conv.messages ? conv.messages.length : 0,
      messages: undefined // Don't send all messages in list view
    }));

    const total = await Conversation.countDocuments(query);

    res.json({
      conversations: conversationsWithCount,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

// Get a specific conversation with messages
const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const conversation = await Conversation.findById(conversationId)
      .populate('userId', 'name email')
      .lean();

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Check if user has access to this conversation
    if (req.user.role !== 'admin' && conversation.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Add id field for frontend compatibility
    res.json({
      ...conversation,
      id: conversation._id,
      messageCount: conversation.messages ? conversation.messages.length : 0
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};

// Create a new conversation
const createConversation = async (req, res) => {
  try {
    const { title, language = 'fr', initialMessage } = req.body;
    
    // Generate title from initial message if not provided
    let conversationTitle = title;
    if (!conversationTitle && initialMessage) {
      const cleanMsg = initialMessage.trim();
      conversationTitle = cleanMsg.substring(0, 50) + (cleanMsg.length > 50 ? '...' : '');
    }
    
    const conversation = new Conversation({
      userId: req.user.id,
      title: conversationTitle,
      language,
      messages: initialMessage ? [{
        role: 'user',
        content: initialMessage
      }] : []
    });

    await conversation.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'stats.totalConversations': 1 }
    });

    // Return with id field for frontend compatibility
    const result = conversation.toObject();
    res.status(201).json({
      ...result,
      id: result._id,
      messageCount: result.messages ? result.messages.length : 0
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

// Add a message to a conversation
const addMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, role = 'user' } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Check access
    if (conversation.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate embeddings for the message content
    let embeddings = null;
    try {
      embeddings = await qwenService.generateEmbeddings(content);
    } catch (error) {
      console.warn('Failed to generate embeddings:', error.message);
    }

    const newMessage = {
      role,
      content: content.trim(),
      metadata: {
        embeddings,
        tokens: content.split(' ').length, // Simple token count
        timestamp: new Date()
      }
    };

    conversation.messages.push(newMessage);
    conversation.updatedAt = new Date();

    await conversation.save();

    // Update user message stats
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'stats.totalMessages': 1 }
    });

    res.json({
      message: newMessage,
      conversationId: conversation._id
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
};

// Generate AI response for a conversation
const generateResponse = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userMessage, context = '' } = req.body;

    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Check access
    if (conversation.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Build conversation history for context
    const chatHistory = conversation.messages.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Add current user message
    chatHistory.push({
      role: 'user',
      content: userMessage.trim()
    });

    // Try to generate AI response using Qwen
    let responseContent;
    try {
      const aiResponse = await qwenService.generateChatResponse(chatHistory, {
        systemPrompt: `Tu es un assistant gouvernemental intelligent pour les citoyens tunisiens et algériens.
Tu aides les utilisateurs à comprendre les démarches administratives, les documents nécessaires et les procédures.
Services disponibles: acte de naissance, passeport biométrique, carte d'identité, permis de conduire, etc.
Réponds de manière claire, concise et utile en français ou en arabe selon la langue de l'utilisateur.
${context ? `Contexte supplémentaire: ${context}` : ''}`
      });
      
      if (aiResponse) {
        responseContent = aiResponse;
      }
    } catch (aiError) {
      console.warn('AI generation failed, using fallback:', aiError.message);
    }
    
    // Fallback response if AI fails
    if (!responseContent) {
      responseContent = `Je vous remercie pour votre question. Malheureusement, je ne peux pas vous répondre en ce moment. 
Veuillez consulter notre section FAQ ou contacter directement le service concerné.

شكرا على سؤالك. للأسف، لا أستطيع الرد عليك الآن. 
يرجى الرجوع إلى قسم الأسئلة الشائعة أو الاتصال بالخدمة المعنية مباشرة.`;
    }

    // Add both user message and AI response
    const userMsg = {
      role: 'user',
      content: userMessage.trim(),
      metadata: {
        timestamp: new Date()
      }
    };

    const aiMsg = {
      role: 'assistant',
      content: responseContent,
      metadata: {
        timestamp: new Date(),
        confidence: 0.8
      }
    };

    // Generate embeddings for both messages
    try {
      const [userEmbedding, aiEmbedding] = await qwenService.generateEmbeddings([
        userMessage,
        responseContent
      ]);
      
      userMsg.metadata.embeddings = userEmbedding;
      aiMsg.metadata.embeddings = aiEmbedding;
    } catch (error) {
      console.warn('Failed to generate embeddings:', error.message);
    }

    conversation.messages.push(userMsg, aiMsg);
    conversation.updatedAt = new Date();

    await conversation.save();

    res.json({
      userMessage: userMsg,
      aiResponse: aiMsg,
      conversationId: conversation._id
    });
  } catch (error) {
    console.error('Error generating response:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
};

// Update conversation (title, tags, etc.)
const updateConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { title, tags, language } = req.body;

    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Check access
    if (conversation.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (title) conversation.title = title.trim();
    if (tags) conversation.tags = tags;
    if (language) conversation.language = language;
    
    conversation.updatedAt = new Date();
    await conversation.save();

    res.json(conversation);
  } catch (error) {
    console.error('Error updating conversation:', error);
    res.status(500).json({ error: 'Failed to update conversation' });
  }
};

// Delete a conversation
const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Check access
    if (conversation.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Soft delete by setting isActive to false
    conversation.isActive = false;
    await conversation.save();

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
};

// Search conversations using embeddings
const searchConversations = async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;
    
    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Get user's conversations with embeddings
    const conversations = await Conversation.find({
      userId: req.user.id,
      isActive: true,
      'messages.metadata.embeddings': { $exists: true, $ne: null }
    }).lean();

    // Extract messages with embeddings
    const messagesWithEmbeddings = [];
    conversations.forEach(conv => {
      conv.messages.forEach(msg => {
        if (msg.metadata && msg.metadata.embeddings) {
          messagesWithEmbeddings.push({
            conversationId: conv._id,
            conversationTitle: conv.title,
            messageContent: msg.content,
            messageRole: msg.role,
            timestamp: msg.createdAt || msg.metadata.timestamp,
            embedding: msg.metadata.embeddings
          });
        }
      });
    });

    if (messagesWithEmbeddings.length === 0) {
      return res.json({ results: [], message: 'No conversations with embeddings found' });
    }

    // Find similar messages
    const similarMessages = await qwenService.findSimilar(
      query,
      messagesWithEmbeddings,
      limit
    );

    res.json({
      results: similarMessages.map(item => ({
        conversationId: item.document.conversationId,
        conversationTitle: item.document.conversationTitle,
        messageContent: item.document.messageContent,
        messageRole: item.document.messageRole,
        timestamp: item.document.timestamp,
        similarity: item.score
      })),
      query,
      totalFound: similarMessages.length
    });
  } catch (error) {
    console.error('Error searching conversations:', error);
    res.status(500).json({ error: 'Failed to search conversations' });
  }
};

module.exports = {
  getUserConversations,
  getConversation,
  createConversation,
  addMessage,
  generateResponse,
  updateConversation,
  deleteConversation,
  searchConversations
};