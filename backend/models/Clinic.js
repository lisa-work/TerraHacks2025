const mongoose = require('mongoose');
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

const clinicSchema = new mongoose.Schema({
  // Basic clinic information
  clinicId: {
    type: String,
    required: true,
    unique: true,
    default: () => 'CLINIC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
  },
  
  name: {
    type: String,
    required: true,
    set: encryptField,
    get: decryptField
  },
  
  type: {
    type: String,
    enum: ['hospital', 'clinic', 'urgent_care', 'specialty_center', 'telemedicine', 'home_health'],
    required: true
  },

  // Contact information
  contact: {
    phone: { type: String, set: encryptField, get: decryptField },
    email: { type: String, set: encryptField, get: decryptField },
    website: String,
    emergencyPhone: { type: String, set: encryptField, get: decryptField }
  },

  // Address and location
  address: {
    street: { type: String, set: encryptField, get: decryptField },
    city: { type: String, set: encryptField, get: decryptField },
    state: { type: String, set: encryptField, get: decryptField },
    zipCode: { type: String, set: encryptField, get: decryptField },
    country: { type: String, default: 'USA' },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  // Services and specialties
  specialties: [String],
  services: [{
    name: String,
    description: String,
    available: { type: Boolean, default: true },
    cost: Number
  }],

  // Operating hours
  operatingHours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },

  // Emergency services
  emergencyServices: {
    available: { type: Boolean, default: false },
    level: { type: String, enum: ['level_1', 'level_2', 'level_3', 'level_4', 'level_5'] },
    traumaCenter: { type: Boolean, default: false },
    strokeCenter: { type: Boolean, default: false },
    heartCenter: { type: Boolean, default: false }
  },

  // Insurance and payment
  acceptedInsurance: [String],
  paymentMethods: [{
    type: { type: String, enum: ['cash', 'credit_card', 'debit_card', 'insurance', 'medicare', 'medicaid'] },
    accepted: { type: Boolean, default: true }
  }],

  // Staff and capacity
  staff: {
    doctors: { type: Number, default: 0 },
    nurses: { type: Number, default: 0 },
    specialists: { type: Number, default: 0 },
    supportStaff: { type: Number, default: 0 }
  },
  
  capacity: {
    beds: { type: Number, default: 0 },
    examRooms: { type: Number, default: 0 },
    operatingRooms: { type: Number, default: 0 },
    waitingArea: { type: Number, default: 0 }
  },

  // Accreditation and licensing
  accreditation: {
    jcaho: { type: Boolean, default: false },
    aaaasf: { type: Boolean, default: false },
    other: [String]
  },
  
  licenses: [{
    type: String,
    number: { type: String, set: encryptField, get: decryptField },
    issuingAuthority: String,
    expiryDate: Date
  }],

  // Technology and equipment
  technology: {
    telemedicine: { type: Boolean, default: false },
    electronicHealthRecords: { type: Boolean, default: true },
    digitalImaging: { type: Boolean, default: false },
    laboratory: { type: Boolean, default: false },
    pharmacy: { type: Boolean, default: false }
  },

  // Quality metrics
  qualityMetrics: {
    patientSatisfaction: { type: Number, min: 0, max: 5 },
    waitTime: { type: Number }, // average wait time in minutes
    readmissionRate: { type: Number }, // percentage
    infectionRate: { type: Number }, // percentage
    lastUpdated: { type: Date, default: Date.now }
  },

  // Status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  isEmergency: { type: Boolean, default: false },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Indexes for performance
clinicSchema.index({ 'address.coordinates': '2dsphere' });
clinicSchema.index({ type: 1 });
clinicSchema.index({ specialties: 1 });
clinicSchema.index({ isActive: 1 });
clinicSchema.index({ clinicId: 1 });

// Virtual for full address
clinicSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`;
});

// Method to check if clinic is open
clinicSchema.methods.isOpen = function() {
  const now = new Date();
  const dayOfWeek = now.toLocaleLowerCase().slice(0, 3);
  const currentTime = now.toTimeString().slice(0, 5);
  
  const todayHours = this.operatingHours[dayOfWeek];
  if (!todayHours || todayHours.closed) return false;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

// Method to get distance from coordinates
clinicSchema.methods.getDistance = function(lat, lng) {
  if (!this.address.coordinates || !lat || !lng) return null;
  
  const R = 6371; // Earth's radius in km
  const dLat = (lat - this.address.coordinates.latitude) * Math.PI / 180;
  const dLng = (lng - this.address.coordinates.longitude) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.address.coordinates.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};

// Static method to find nearby clinics
clinicSchema.statics.findNearby = function(lat, lng, maxDistance = 50) {
  return this.find({
    'address.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: maxDistance * 1000 // Convert to meters
      }
    },
    isActive: true
  }).limit(20);
};

// Static method to find clinics by specialty
clinicSchema.statics.findBySpecialty = function(specialty) {
  return this.find({
    specialties: { $in: [specialty] },
    isActive: true
  });
};

module.exports = mongoose.model('Clinic', clinicSchema); 