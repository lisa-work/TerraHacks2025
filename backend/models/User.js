const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// HIPAA encryption helper
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

const userSchema = new mongoose.Schema({
  // Authentication
  authProvider: {
    type: String,
    enum: ['auth0', 'clerk', 'firebase', 'local'],
    default: 'auth0'
  },
  authId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() { return this.authProvider === 'local'; }
  },

  // User Type
  userType: {
    type: String,
    enum: ['patient', 'doctor', 'nurse', 'admin', 'clinic_staff'],
    required: true
  },

  // Basic Info (encrypted for HIPAA compliance)
  firstName: {
    type: String,
    required: true,
    set: encryptField,
    get: decryptField
  },
  lastName: {
    type: String,
    required: true,
    set: encryptField,
    get: decryptField
  },
  dateOfBirth: {
    type: Date,
    set: function(val) {
      return val ? encryptField(val.toISOString()) : val;
    },
    get: function(val) {
      return val ? new Date(decryptField(val)) : val;
    }
  },
  phone: {
    type: String,
    set: encryptField,
    get: decryptField
  },

  // Address
  address: {
    street: { type: String, set: encryptField, get: decryptField },
    city: { type: String, set: encryptField, get: decryptField },
    state: { type: String, set: encryptField, get: decryptField },
    zipCode: { type: String, set: encryptField, get: decryptField },
    country: { type: String, default: 'USA' }
  },

  // Medical Information (encrypted)
  medicalInfo: {
    bloodType: { type: String, set: encryptField, get: decryptField },
    allergies: [{ type: String, set: encryptField, get: decryptField }],
    medications: [{ type: String, set: encryptField, get: decryptField }],
    conditions: [{ type: String, set: encryptField, get: decryptField }],
    emergencyContact: {
      name: { type: String, set: encryptField, get: decryptField },
      relationship: { type: String, set: encryptField, get: decryptField },
      phone: { type: String, set: encryptField, get: decryptField }
    }
  },

  // Insurance Information (encrypted)
  insurance: {
    provider: { type: String, set: encryptField, get: decryptField },
    policyNumber: { type: String, set: encryptField, get: decryptField },
    groupNumber: { type: String, set: encryptField, get: decryptField },
    memberId: { type: String, set: encryptField, get: decryptField }
  },

  // For Healthcare Providers
  providerInfo: {
    licenseNumber: { type: String, set: encryptField, get: decryptField },
    specialties: [String],
    education: [{
      institution: String,
      degree: String,
      year: Number
    }],
    experience: Number, // years of experience
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' }
  },

  // Preferences
  preferences: {
    language: { type: String, default: 'en' },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    timezone: { type: String, default: 'UTC' }
  },

  // Status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  lastLogin: { type: Date, default: Date.now },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ authId: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ 'providerInfo.clinicId': 1 });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.authProvider === 'local') {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Password verification method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.medicalInfo;
  delete userObject.insurance;
  delete userObject.authId;
  return userObject;
};

module.exports = mongoose.model('User', userSchema); 