import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
    memberId?: string;
    planType?: string;
  };
  medicalHistory: {
    allergies: string[];
    medications: Array<{
      name: string;
      dosage: string;
      frequency: string;
      startDate: Date;
      endDate?: Date;
      prescribedBy: string;
    }>;
    conditions: Array<{
      name: string;
      diagnosedDate: Date;
      status: 'active' | 'resolved' | 'chronic';
      notes?: string;
    }>;
    surgeries: Array<{
      procedure: string;
      date: Date;
      hospital: string;
      surgeon: string;
      notes?: string;
    }>;
    familyHistory: Array<{
      relationship: string;
      condition: string;
      ageOfOnset?: number;
    }>;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
      email?: string;
    };
    bloodType?: string;
    height?: number; // in cm
    weight?: number; // in kg
    lastUpdated: Date;
  };
  preferences: {
    language: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacySettings: {
      shareDataForResearch: boolean;
      allowMarketingCommunications: boolean;
    };
  };
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(value: Date) {
        return !value || value <= new Date();
      },
      message: 'Date of birth cannot be in the future'
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
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
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    }
  },
  insurance: {
    provider: {
      type: String,
      required: [true, 'Insurance provider is required'],
      trim: true
    },
    policyNumber: {
      type: String,
      required: [true, 'Policy number is required'],
      trim: true
    },
    groupNumber: {
      type: String,
      required: [true, 'Group number is required'],
      trim: true
    },
    memberId: {
      type: String,
      trim: true
    },
    planType: {
      type: String,
      trim: true
    }
  },
  medicalHistory: {
    allergies: [{
      type: String,
      trim: true
    }],
    medications: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      dosage: {
        type: String,
        required: true,
        trim: true
      },
      frequency: {
        type: String,
        required: true,
        trim: true
      },
      startDate: {
        type: Date,
        required: true
      },
      endDate: Date,
      prescribedBy: {
        type: String,
        required: true,
        trim: true
      }
    }],
    conditions: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      diagnosedDate: {
        type: Date,
        required: true
      },
      status: {
        type: String,
        enum: ['active', 'resolved', 'chronic'],
        required: true
      },
      notes: {
        type: String,
        trim: true
      }
    }],
    surgeries: [{
      procedure: {
        type: String,
        required: true,
        trim: true
      },
      date: {
        type: Date,
        required: true
      },
      hospital: {
        type: String,
        required: true,
        trim: true
      },
      surgeon: {
        type: String,
        required: true,
        trim: true
      },
      notes: {
        type: String,
        trim: true
      }
    }],
    familyHistory: [{
      relationship: {
        type: String,
        required: true,
        trim: true
      },
      condition: {
        type: String,
        required: true,
        trim: true
      },
      ageOfOnset: Number
    }],
    emergencyContact: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      relationship: {
        type: String,
        required: true,
        trim: true
      },
      phone: {
        type: String,
        required: true,
        match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
      },
      email: {
        type: String,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
      }
    },
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    height: {
      type: Number,
      min: [50, 'Height must be at least 50 cm'],
      max: [300, 'Height cannot exceed 300 cm']
    },
    weight: {
      type: Number,
      min: [1, 'Weight must be at least 1 kg'],
      max: [1000, 'Weight cannot exceed 1000 kg']
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  preferences: {
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko']
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    privacySettings: {
      shareDataForResearch: {
        type: Boolean,
        default: false
      },
      allowMarketingCommunications: {
        type: Boolean,
        default: false
      }
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  lastLogin: Date
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      delete ret.password;
      delete ret.verificationToken;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      return ret;
    }
  }
});

// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ 'location.lat': 1, 'location.lng': 1 });
UserSchema.index({ createdAt: -1 });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Update medicalHistory.lastUpdated when medical history is modified
UserSchema.pre('save', function(next) {
  if (this.isModified('medicalHistory')) {
    this.medicalHistory.lastUpdated = new Date();
  }
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

export default mongoose.model<IUser>('User', UserSchema);