import mongoose, { Document, Schema } from 'mongoose';

export interface IClinic extends Document {
  name: string;
  type: 'hospital' | 'urgent_care' | 'clinic' | 'specialist' | 'laboratory' | 'pharmacy';
  address: string;
  phone: string;
  email?: string;
  website?: string;
  location: {
    lat: number;
    lng: number;
  };
  operatingHours: Array<{
    day: string;
    open: string;
    close: string;
    isOpen: boolean;
  }>;
  services: string[];
  specialties: string[];
  insuranceAccepted: string[];
  facilities: string[];
  emergencyServices: boolean;
  telemedicineAvailable: boolean;
  rating: number;
  reviewCount: number;
  images: string[];
  description?: string;
  contactInfo: {
    mainPhone: string;
    emergencyPhone?: string;
    appointmentPhone?: string;
    fax?: string;
  };
  staff: Array<{
    name: string;
    title: string;
    specialties: string[];
    qualifications: string[];
    availableDays: string[];
    image?: string;
  }>;
  pricing: {
    consultationFee: number;
    emergencyFee?: number;
    insuranceCoverage: Array<{
      provider: string;
      coveragePercentage: number;
    }>;
  };
  waitTimes: {
    emergency: number; // in minutes
    urgent: number;
    routine: number;
    lastUpdated: Date;
  };
  certifications: string[];
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClinicSchema = new Schema<IClinic>({
  name: {
    type: String,
    required: [true, 'Clinic name is required'],
    trim: true,
    maxlength: [200, 'Clinic name cannot exceed 200 characters']
  },
  type: {
    type: String,
    required: [true, 'Clinic type is required'],
    enum: ['hospital', 'urgent_care', 'clinic', 'specialist', 'laboratory', 'pharmacy']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },
  location: {
    lat: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  },
  operatingHours: [{
    day: {
      type: String,
      required: true,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    open: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
    },
    close: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
    },
    isOpen: {
      type: Boolean,
      default: true
    }
  }],
  services: [{
    type: String,
    trim: true
  }],
  specialties: [{
    type: String,
    trim: true
  }],
  insuranceAccepted: [{
    type: String,
    trim: true
  }],
  facilities: [{
    type: String,
    trim: true
  }],
  emergencyServices: {
    type: Boolean,
    default: false
  },
  telemedicineAvailable: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot exceed 5']
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: [0, 'Review count cannot be negative']
  },
  images: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  contactInfo: {
    mainPhone: {
      type: String,
      required: true,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
    },
    emergencyPhone: {
      type: String,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
    },
    appointmentPhone: {
      type: String,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
    },
    fax: {
      type: String,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid fax number']
    }
  },
  staff: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    specialties: [{
      type: String,
      trim: true
    }],
    qualifications: [{
      type: String,
      trim: true
    }],
    availableDays: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    image: {
      type: String,
      trim: true
    }
  }],
  pricing: {
    consultationFee: {
      type: Number,
      required: true,
      min: [0, 'Consultation fee cannot be negative']
    },
    emergencyFee: {
      type: Number,
      min: [0, 'Emergency fee cannot be negative']
    },
    insuranceCoverage: [{
      provider: {
        type: String,
        required: true,
        trim: true
      },
      coveragePercentage: {
        type: Number,
        required: true,
        min: [0, 'Coverage percentage cannot be less than 0'],
        max: [100, 'Coverage percentage cannot exceed 100']
      }
    }]
  },
  waitTimes: {
    emergency: {
      type: Number,
      default: 15,
      min: [0, 'Wait time cannot be negative']
    },
    urgent: {
      type: Number,
      default: 45,
      min: [0, 'Wait time cannot be negative']
    },
    routine: {
      type: Number,
      default: 120,
      min: [0, 'Wait time cannot be negative']
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  certifications: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
ClinicSchema.index({ 'location.lat': 1, 'location.lng': 1 });
ClinicSchema.index({ type: 1 });
ClinicSchema.index({ specialties: 1 });
ClinicSchema.index({ insuranceAccepted: 1 });
ClinicSchema.index({ emergencyServices: 1 });
ClinicSchema.index({ rating: -1 });
ClinicSchema.index({ isActive: 1, isVerified: 1 });
ClinicSchema.index({ name: 'text', description: 'text', specialties: 'text' });

export default mongoose.model<IClinic>('Clinic', ClinicSchema);