const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
  order: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  estimatedTime: String, 
  requirements: [String],
  isOptional: {
    type: Boolean,
    default: false
  }
});

const formSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  description: String,
  fileSize: String,
  language: {
    type: String,
    enum: ['fr', 'ar', 'both'],
    default: 'fr'
  }
});

const faqSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true,
    trim: true
  },
  language: {
    type: String,
    enum: ['fr', 'ar'],
    default: 'fr'
  },
  keywords: [String], // For better search
  popularity: {
    type: Number,
    default: 0
  }
});

const contactSchema = new mongoose.Schema({
  phone: String,
  email: String,
  address: String,
  hours: String,
  website: String,
  emergencyContact: String
});

const serviceSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['documents', 'health', 'education', 'social', 'administrative', 'legal', 'other']
  },
  steps: [stepSchema],
  forms: [formSchema],
  faq: [faqSchema],
  contact: contactSchema,
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 1, // 1-5, higher is more important
    min: 1,
    max: 5
  },
  tags: [String],
  language: {
    type: String,
    enum: ['fr', 'ar', 'both'],
    default: 'fr'
  },
  metadata: {
    estimatedDuration: String,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    cost: String,
    requiredDocuments: [String],
    eligibility: [String]
  },
  stats: {
    views: {
      type: Number,
      default: 0
    },
    completions: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      min: 1,
      max: 5
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance (id index is automatic from unique: true)
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ tags: 1 });
serviceSchema.index({ 'stats.views': -1 });
serviceSchema.index({ title: 'text', description: 'text' }); // Text search

// Update stats when accessed
serviceSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  return this.save();
};

// Virtual for total FAQ items
serviceSchema.virtual('faqCount').get(function() {
  return this.faq.length;
});

// Virtual for total steps
serviceSchema.virtual('stepCount').get(function() {
  return this.steps.length;
});

module.exports = mongoose.model('Service', serviceSchema);
