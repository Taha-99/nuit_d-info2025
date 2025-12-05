const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous feedback
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: false
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: false // Link to specific conversation if applicable
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  suggestion: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    enum: ['service', 'interface', 'performance', 'content', 'bug', 'other'],
    default: 'other'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  adminResponse: {
    message: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    sessionDuration: Number,
    pageUrl: String,
    language: {
      type: String,
      enum: ['fr', 'ar'],
      default: 'fr'
    }
  },
  sentiment: {
    score: Number, // -1 to 1, negative to positive
    confidence: Number, // 0 to 1
    keywords: [String]
  }
}, {
  timestamps: true
});

// Indexes for better performance
feedbackSchema.index({ userId: 1 });
feedbackSchema.index({ serviceId: 1 });
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ category: 1, status: 1 });

// Virtual for helpful score
feedbackSchema.virtual('isHelpful').get(function() {
  return this.rating >= 4;
});

// Static method to get average rating for a service
feedbackSchema.statics.getAverageRating = function(serviceId) {
  return this.aggregate([
    { $match: { serviceId: serviceId } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
};

// Static method to get feedback stats
feedbackSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

module.exports = mongoose.model('Feedback', feedbackSchema);
