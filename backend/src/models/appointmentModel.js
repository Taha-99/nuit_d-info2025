const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  service: {
    type: String,
    required: true,
  },
  serviceAr: {
    type: String,
    required: true,
  },
  serviceType: {
    type: String,
    enum: ['id_card', 'passport', 'birth_cert', 'residence', 'family_book', 'driver_license', 'other'],
    default: 'other',
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  locationAr: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'pending',
  },
  notes: { type: String },
  confirmationCode: { type: String },
  reminderSent: { type: Boolean, default: false },
  cancelledAt: { type: Date },
  cancellationReason: { type: String },
}, {
  timestamps: true,
});

// Generate confirmation code before save
appointmentSchema.pre('save', async function() {
  if (!this.confirmationCode) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'RDV-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.confirmationCode = code;
  }
});

// Index for faster queries
appointmentSchema.index({ userId: 1, date: 1 });
appointmentSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
