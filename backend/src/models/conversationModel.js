const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  metadata: {
    embeddings: [Number], // For Qwen3 embeddings
    tokens: Number,
    timestamp: Date,
    confidence: Number
  }
}, {
  timestamps: true
});

const conversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: 200
  },
  messages: [messageSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String], // For categorizing conversations
  summary: String, // AI-generated summary for long conversations
  language: {
    type: String,
    enum: ['fr', 'ar'],
    default: 'fr'
  },
  metadata: {
    totalTokens: Number,
    avgResponseTime: Number,
    userSatisfaction: Number
  }
}, {
  timestamps: true
});

// Indexes for better performance
conversationSchema.index({ userId: 1, createdAt: -1 });
conversationSchema.index({ userId: 1, isActive: 1 });
conversationSchema.index({ tags: 1 });

// Auto-generate title from first user message if not provided
conversationSchema.pre('save', async function() {
  // Always update title based on first user message
  if (this.messages && this.messages.length > 0) {
    const firstUserMessage = this.messages.find(msg => msg.role === 'user');
    if (firstUserMessage && firstUserMessage.content) {
      // Clean up the message and use as title
      const cleanContent = firstUserMessage.content.trim();
      if (!this.title || this.title === 'Nouvelle conversation') {
        this.title = cleanContent.substring(0, 50) + (cleanContent.length > 50 ? '...' : '');
      }
    }
  }
});

// Virtual for message count
conversationSchema.virtual('messageCount').get(function() {
  return this.messages ? this.messages.length : 0;
});

// Ensure virtuals are included in JSON
conversationSchema.set('toJSON', { virtuals: true });
conversationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Conversation', conversationSchema);