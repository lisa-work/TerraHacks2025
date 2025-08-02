const mongoose = require('mongoose');
const crypto = require('crypto');

// HIPAA encryption helper (same as User model)
const encryptField = (text) => {
  if (!text) return text;
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(process.env.HIPAA_ENCRYPTION_KEY || 'default-key', 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decryptField = (encryptedText) => {
  if (!encryptedText) return encryptedText;
  try {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.HIPAA_ENCRYPTION_KEY || 'default-key', 'salt', 32);
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedData = textParts.join(':');
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText;
  }
};

const appointmentSchema = new mongoose.Schema({
  // Basic appointment info
  appointmentId: {
    type: String,
    required: true,
    unique: true,
    default: () => 'APT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
  },

  // Participants
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clinicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clinic'
  },

  // Appointment details
  appointmentType: {
    type: String,
    enum: ['consultation', 'checkup', 'emergency', 'followup', 'procedure', 'surgery', 'telemedicine'],
    required: true
  },
  
  specialty: {
    type: String,
    required: true
  },

  // Date and time
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 30
  },
  timezone: {
    type: String,
    default: 'UTC'
  },

  // Status tracking
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'],
    default: 'scheduled'
  },

  // Location
  location: {
    type: {
      type: String,
      enum: ['in_person', 'telemedicine', 'home_visit'],
      default: 'in_person'
    },
    address: {
      street: { type: String, set: encryptField, get: decryptField },
      city: { type: String, set: encryptField, get: decryptField },
      state: { type: String, set: encryptField, get: decryptField },
      zipCode: { type: String, set: encryptField, get: decryptField }
    },
    roomNumber: String,
    telemedicineUrl: String
  },

  // Medical information (encrypted)
  symptoms: {
    type: String,
    set: encryptField,
    get: decryptField
  },
  diagnosis: {
    type: String,
    set: encryptField,
    get: decryptField
  },
  treatment: {
    type: String,
    set: encryptField,
    get: decryptField
  },
  notes: {
    type: String,
    set: encryptField,
    get: decryptField
  },
  prescriptions: [{
    medication: { type: String, set: encryptField, get: decryptField },
    dosage: { type: String, set: encryptField, get: decryptField },
    frequency: { type: String, set: encryptField, get: decryptField },
    duration: { type: String, set: encryptField, get: decryptField },
    instructions: { type: String, set: encryptField, get: decryptField }
  }],

  // Insurance and billing
  insurance: {
    provider: { type: String, set: encryptField, get: decryptField },
    policyNumber: { type: String, set: encryptField, get: decryptField },
    copay: { type: Number, default: 0 },
    deductible: { type: Number, default: 0 }
  },
  cost: {
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    isPaid: { type: Boolean, default: false },
    paymentMethod: String
  },

  // AI Triage information
  aiTriage: {
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'emergency'],
      default: 'medium'
    },
    recommendedSpecialty: String,
    symptoms: [String],
    riskFactors: [String],
    aiConfidence: { type: Number, min: 0, max: 1 },
    triageNotes: String
  },

  // Reminders and notifications
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'push', 'call']
    },
    scheduledFor: Date,
    sent: { type: Boolean, default: false },
    sentAt: Date
  }],

  // History and tracking
  statusHistory: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
    reason: String
  }],

  // Cancellation/Rescheduling
  cancellation: {
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancelledAt: Date,
    reason: String,
    refundAmount: Number
  },

  // Follow-up
  followUp: {
    required: { type: Boolean, default: false },
    scheduledDate: Date,
    reason: String
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Indexes for performance
appointmentSchema.index({ patientId: 1, scheduledDate: 1 });
appointmentSchema.index({ doctorId: 1, scheduledDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentId: 1 });
appointmentSchema.index({ 'aiTriage.urgency': 1 });

// Pre-save middleware to update status history
appointmentSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date()
    });
  }
  next();
});

// Virtual for appointment duration in hours
appointmentSchema.virtual('durationHours').get(function() {
  return this.duration / 60;
});

// Virtual for appointment end time
appointmentSchema.virtual('endTime').get(function() {
  return new Date(this.scheduledDate.getTime() + this.duration * 60000);
});

// Method to check if appointment is in the past
appointmentSchema.methods.isPast = function() {
  return this.scheduledDate < new Date();
};

// Method to check if appointment is today
appointmentSchema.methods.isToday = function() {
  const today = new Date();
  const appointmentDate = new Date(this.scheduledDate);
  return appointmentDate.toDateString() === today.toDateString();
};

// Method to get appointment summary (for notifications)
appointmentSchema.methods.getSummary = function() {
  return {
    appointmentId: this.appointmentId,
    type: this.appointmentType,
    date: this.scheduledDate,
    status: this.status,
    location: this.location.type
  };
};

// Static method to find upcoming appointments
appointmentSchema.statics.findUpcoming = function(userId, limit = 10) {
  return this.find({
    $or: [{ patientId: userId }, { doctorId: userId }],
    scheduledDate: { $gte: new Date() },
    status: { $in: ['scheduled', 'confirmed'] }
  })
  .sort({ scheduledDate: 1 })
  .limit(limit)
  .populate('patientId', 'firstName lastName')
  .populate('doctorId', 'firstName lastName');
};

module.exports = mongoose.model('Appointment', appointmentSchema); 