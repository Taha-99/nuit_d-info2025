const mongoose = require('mongoose');

const documentStepSchema = new mongoose.Schema({
  label: { type: String, required: true },
  labelAr: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
}, { _id: false });

const documentSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  titleAr: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['birth_certificate', 'id_card', 'passport', 'residence_certificate', 'family_book', 'driver_license', 'other'],
    default: 'other',
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected'],
    default: 'pending',
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  steps: [documentStepSchema],
  notes: { type: String },
  rejectionReason: { type: String },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: { type: Date },
  estimatedCompletionDate: { type: Date },
}, {
  timestamps: true,
});

// Generate tracking ID before validation (runs before save)
documentSchema.pre('validate', async function() {
  if (!this.trackingId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Document').countDocuments();
    this.trackingId = `DOC-${year}-${String(count + 1).padStart(4, '0')}`;
  }
});

// Auto-calculate progress and status before save
documentSchema.pre('save', function() {
  // Auto-calculate progress based on completed steps
  if (this.steps && this.steps.length > 0) {
    const completedSteps = this.steps.filter(s => s.completed).length;
    this.progress = Math.round((completedSteps / this.steps.length) * 100);
  }
  
  // Auto-update status based on progress
  if (this.progress === 100 && this.status !== 'rejected') {
    this.status = 'completed';
    this.completedAt = new Date();
  } else if (this.progress > 0 && this.status === 'pending') {
    this.status = 'processing';
  }
});

// Index for faster queries
documentSchema.index({ userId: 1, status: 1 });
documentSchema.index({ trackingId: 1 });

module.exports = mongoose.model('Document', documentSchema);
