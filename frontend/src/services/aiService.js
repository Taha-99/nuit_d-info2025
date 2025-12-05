import { 
  createConversation as apiCreateConversation,
  getConversation as apiGetConversation,
  deleteConversation as apiDeleteConversation,
  generateAIResponse as apiGenerateAIResponse,
  searchConversations as apiSearchConversations,
  getUserConversations as apiGetUserConversations,
  searchKnowledge 
} from './apiService';
import offlineFaq from '../data/offlineFaq';

class AIService {
  constructor() {
    this.currentConversation = null;
    this.conversationHistory = [];
    this.isOnline = navigator.onLine;
    this.setupNetworkListeners();
  }

  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  getCachedUser() {
    try {
      const cached = localStorage.getItem('user');
      if (!cached) return null;
      const user = JSON.parse(cached);
      // Normalize user ID (could be id or _id depending on source)
      return {
        ...user,
        id: user.id || user._id
      };
    } catch (error) {
      console.warn('Failed to parse cached user:', error);
      return null;
    }
  }

  normalizeConversation(conversation) {
    if (!conversation) return null;
    return {
      ...conversation,
      id: conversation.id || conversation._id || conversation.conversationId,
      messages: conversation.messages || [],
    };
  }

  // Start a new conversation
  async startConversation(userId, title = null, language = 'fr') {
    try {
      if (!this.isOnline) {
        return this.createOfflineConversation(title, language);
      }

      const conversationData = {
        title: title || 'Nouvelle conversation',
        language
      };

      const conversation = await apiCreateConversation(conversationData);
      const normalized = this.normalizeConversation(conversation);
      this.currentConversation = normalized;
      
      return normalized;
    } catch (error) {
      console.error('Error starting conversation:', error);
      return this.createOfflineConversation(title, language);
    }
  }

  createOfflineConversation(title, language) {
    this.currentConversation = {
      id: `offline_${Date.now()}`,
      title: title || 'Conversation hors ligne',
      language,
      messages: [],
      isOffline: true,
      createdAt: new Date().toISOString()
    };
    return this.currentConversation;
  }

  async createConversation(payload = {}) {
    const { title = null, language = 'fr' } = payload;
    return this.startConversation(null, title, language);
  }

  async getUserConversations(params = {}) {
    if (!this.isOnline) {
      return [];
    }

    try {
      const user = this.getCachedUser();
      if (!user?.id) {
        return [];
      }

      const response = await apiGetUserConversations(user.id, params);
      const conversations = response?.conversations || response || [];
      const normalized = conversations.map((conversation) => this.normalizeConversation(conversation));
      this.conversationHistory = normalized;
      return normalized;
    } catch (error) {
      console.error('Error fetching user conversations:', error);
      return [];
    }
  }

  async getConversation(conversationId) {
    if (!conversationId) return null;

    if (!this.isOnline) {
      return this.currentConversation && this.currentConversation.id === conversationId
        ? this.currentConversation
        : this.currentConversation;
    }

    try {
      const conversation = await apiGetConversation(conversationId);
      return this.normalizeConversation(conversation);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  }

  async clearConversation(conversationId) {
    if (!conversationId) return false;

    if (!this.isOnline) {
      if (this.currentConversation?.id === conversationId) {
        this.currentConversation = null;
      }
      return true;
    }

    try {
      await apiDeleteConversation(conversationId);
      if (this.currentConversation?.id === conversationId) {
        this.currentConversation = null;
      }
      return true;
    } catch (error) {
      console.error('Error clearing conversation:', error);
      return false;
    }
  }

  // Send a message and get AI response
  async sendMessage(conversationId, userMessage, context = '') {
    try {
      if (!conversationId) {
        // No conversation, use fallback
        return this.getResponse(userMessage, { language: this.detectLanguage(userMessage) || 'fr', offline: !this.isOnline });
      }

      if (!this.isOnline) {
        return this.handleOfflineMessage(userMessage, context);
      }

      const aiResponse = await apiGenerateAIResponse(conversationId, {
        userMessage,
        context
      });

      const assistantMessage = aiResponse?.aiResponse || {};

      return {
        message: assistantMessage.content || 'Je suis là pour vous aider. Posez-moi votre question.',
        recommendations: assistantMessage.metadata?.recommendations || [],
        sources: assistantMessage.metadata?.sources || [],
      };
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback to knowledge base search instead of throwing
      try {
        return await this.getResponse(userMessage, { language: this.detectLanguage(userMessage) || 'fr', offline: false });
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        return this.handleOfflineMessage(userMessage, context);
      }
    }
  }

  async handleOfflineMessage(userMessage, context) {
    try {
      const language = this.detectLanguage(userMessage) || 'fr';
      const response = this.fallbackAnswer(userMessage, language);
      
      if (this.currentConversation && this.currentConversation.isOffline) {
        this.currentConversation.messages.push(
          {
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString()
          },
          {
            role: 'assistant',
            content: response.message,
            timestamp: new Date().toISOString(),
            source: 'offline'
          }
        );
      }

      return {
        message: response.message,
        recommendations: response.recommendations || [],
        sources: response.source ? [response.source] : [],
      };
    } catch (error) {
      console.error('Error in handleOfflineMessage:', error);
      // Ultimate fallback - just return a helpful message
      return {
        message: 'Je suis désolé, je ne peux pas traiter votre demande pour le moment. Veuillez réessayer plus tard ou consulter notre FAQ.',
        recommendations: [],
        sources: [],
      };
    }
  }

  // Fallback for offline responses
  fallbackAnswer(question, language = 'fr') {
    // Safety check for empty FAQ
    if (!offlineFaq || offlineFaq.length === 0) {
      return {
        message: language === 'ar' 
          ? 'عذرًا، لا توجد معلومات متاحة حاليًا. يرجى المحاولة لاحقًا.'
          : 'Désolé, aucune information disponible actuellement. Veuillez réessayer plus tard.',
        recommendations: [],
        source: 'default',
      };
    }

    const normalize = (text) => text.toLowerCase().normalize('NFKD').replace(/[^\w\s]/g, '');
    const cleaned = normalize(question);
    
    let best = offlineFaq[0];
    let score = 0;
    
    offlineFaq.forEach((faq) => {
      const tokens = normalize(faq.question).split(' ');
      const matched = tokens.filter((token) => cleaned.includes(token)).length;
      if (matched > score) {
        best = faq;
        score = matched;
      }
    });

    const text = language === 'ar' ? (best.answerAr || best.answerFr) : (best.answerFr || best.answerAr);
    return {
      message: text || 'Je suis là pour vous aider avec les services publics. Posez-moi une question spécifique.',
      recommendations: [{ id: best.serviceId, title: best.question }],
      source: score > 0 ? 'knowledge-base' : 'default',
    };
  }
  
  // Get response for the Assistant fallback path
  async getResponse(question, { language = 'fr', offline = false } = {}) {
    if (!question) {
      return { message: '', recommendations: [], sources: [] };
    }

    if (offline || !this.isOnline) {
      const fallback = this.fallbackAnswer(question, language);
      return {
        message: fallback.message,
        recommendations: fallback.recommendations || [],
        sources: fallback.source ? [fallback.source] : [],
      };
    }

    try {
      const result = await this.searchKnowledgeBase(question, { language });
      return {
        message: result?.message || result?.answer || '',
        recommendations: result?.recommendations || [],
        sources: result?.sources || (result?.source ? [result.source] : []),
      };
    } catch (error) {
      console.error('Error getting AI response:', error);
      const fallback = this.fallbackAnswer(question, language);
      return {
        message: fallback.message,
        recommendations: fallback.recommendations || [],
        sources: fallback.source ? [fallback.source] : [],
      };
    }
  }

  // Get conversation history
  async getConversationHistory(userId, page = 1, limit = 20) {
    try {
      if (!this.isOnline) {
        return { conversations: [], pagination: { total: 0 } };
      }

      const result = await apiGetUserConversations(userId, { page, limit });
      const conversations = result?.conversations || [];
      this.conversationHistory = conversations.map((conversation) => this.normalizeConversation(conversation));
      return {
        ...result,
        conversations: this.conversationHistory,
      };
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return { conversations: [], pagination: { total: 0 } };
    }
  }

  // Search through conversations using AI embeddings
  async searchConversations(query, limit = 10) {
    try {
      if (!this.isOnline) {
        return this.searchOfflineConversations(query);
      }

      if (!query || !query.trim()) {
        throw new Error('Search query is required');
      }

      const results = await apiSearchConversations({ query, limit });
      return (results?.results || []).map((item) => ({
        id: item.conversationId,
        title: item.conversationTitle || 'Conversation',
        updatedAt: item.timestamp,
        messageCount: item.messageRole ? 1 : undefined,
      }));
    } catch (error) {
      console.error('Error searching conversations:', error);
      return this.searchOfflineConversations(query);
    }
  }

  searchOfflineConversations(query) {
    // Simple offline search in stored conversations
    if (!query) {
      return this.conversationHistory;
    }

    const filtered = this.conversationHistory.filter(conv => 
      conv.title?.toLowerCase().includes(query.toLowerCase())
    );
    return filtered;
  }

  // Search knowledge base
  async searchKnowledgeBase(query, params = {}) {
    try {
      if (!this.isOnline) {
        return this.fallbackAnswer(query, params.language);
      }

      const response = await searchKnowledge({ query, ...params });
      const items = response?.results || [];

      if (!items.length) {
        return this.fallbackAnswer(query, params.language);
      }

      const topResult = items[0];
      const recommendations = items.slice(0, 4).map((item) => ({
        id: item.id,
        title: item.title || item.question || 'Voir le service',
      }));

      return {
        message: `Voici ce que j'ai trouvé pour « ${topResult.title} » : ${topResult.description || 'Service disponible.'}`,
        recommendations,
        source: 'knowledge-base',
      };
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return this.fallbackAnswer(query, params.language);
    }
  }

  // Generate conversation suggestions based on context
  generateSuggestions(context) {
    const suggestions = {
      documents: [
        "Comment obtenir un acte de naissance?",
        "Quelles sont les pièces nécessaires pour un passeport?",
        "Comment renouveler ma carte d'identité?"
      ],
      health: [
        "Comment s'inscrire à l'assurance maladie?",
        "Où trouver les centres de vaccination?",
        "Comment obtenir un certificat médical?"
      ],
      education: [
        "Comment s'inscrire à l'université?",
        "Quelles sont les bourses d'études disponibles?",
        "Comment obtenir une équivalence de diplôme?"
      ],
      social: [
        "Comment demander une aide sociale?",
        "Où s'inscrire au chômage?",
        "Comment obtenir un logement social?"
      ],
      general: [
        "Quels sont les services disponibles?",
        "Comment contacter l'administration?",
        "Où trouver de l'aide?"
      ]
    };

    return suggestions[context] || suggestions.general;
  }

  // Format messages for display
  formatMessage(message) {
    return {
      id: message.id || Date.now(),
      content: message.content,
      role: message.role,
      timestamp: message.createdAt || message.timestamp || new Date().toISOString(),
      metadata: message.metadata || {},
      isOffline: message.source === 'offline'
    };
  }

  // Process AI response with typing animation
  async processAIResponse(response) {
    return new Promise((resolve) => {
      // Simulate processing delay for better UX
      setTimeout(() => {
        resolve(response);
      }, Math.random() * 1000 + 500); // 500-1500ms delay
    });
  }

  // Detect language
  detectLanguage(text) {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text) ? 'ar' : 'fr';
  }

  // Get conversation statistics
  getConversationStats() {
    return {
      totalConversations: this.conversationHistory.length,
      currentConversation: this.currentConversation?.id || null,
      lastActivity: this.conversationHistory[0]?.updatedAt || null,
      isOnline: this.isOnline
    };
  }

  // Clear current conversation
  clearCurrentConversation() {
    this.currentConversation = null;
  }

  // Get current conversation
  getCurrentConversation() {
    return this.currentConversation;
  }

  // Check online status
  isOnlineMode() {
    return this.isOnline;
  }

  // Sync offline conversations when back online
  async syncOfflineData() {
    if (!this.isOnline) return false;

    try {
      // Implementation for syncing offline conversations
      console.log('Syncing offline conversations...');
      return true;
    } catch (error) {
      console.error('Error syncing offline data:', error);
      return false;
    }
  }
}

// Legacy function for compatibility
export const getAIResponse = async (question, { language = 'fr', offline = false } = {}) => {
  const aiService = new AIService();
  
  if (!question) {
    return { message: '', recommendations: [] };
  }

  if (offline || !navigator.onLine) {
    return aiService.fallbackAnswer(question, language);
  }

  try {
    const result = await aiService.searchKnowledgeBase(question, { language });
    return {
      message: result.message || 'Je ne trouve pas d\'information sur ce sujet.',
      recommendations: result.recommendations || [],
      source: result.source || 'ai'
    };
  } catch (error) {
    return aiService.fallbackAnswer(question, language);
  }
};

// Create singleton instance
const aiService = new AIService();
export default aiService;
