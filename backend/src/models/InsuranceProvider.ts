import mongoose, { Document, Schema } from 'mongoose';

export interface IInsuranceProvider extends Document {
  name: string;
  type: 'health' | 'dental' | 'vision' | 'combined';
  networks: string[];
  states: string[];
  planTypes: string[];
  contactInfo: {
    phone: string;
    website?: string;
    customerService?: string;
  };
  coverage: {
    inNetwork: {
      primaryCare: number;
      specialist: number;
      emergency: number;
      urgentCare: number;
      prescription: number;
    };
    outOfNetwork: {
      primaryCare: number;
      specialist: number;
      emergency: number;
      urgentCare: number;
      prescription: number;
    };
    deductible: {
      individual: number;
      family: number;
    };
    outOfPocketMax: {
      individual: number;
      family: number;
    };
  };
  searchKeywords: string[];
  isActive: boolean;
  addedBy: 'system' | 'user' | 'ai';
  createdAt: Date;
  updatedAt: Date;
}

const InsuranceProviderSchema = new Schema<IInsuranceProvider>({
  name: {
    type: String,
    required: [true, 'Insurance provider name is required'],
    unique: true,
    trim: true,
    maxlength: [200, 'Provider name cannot exceed 200 characters']
  },
  type: {
    type: String,
    enum: ['health', 'dental', 'vision', 'combined'],
    default: 'health'
  },
  networks: [{
    type: String,
    trim: true
  }],
  states: [{
    type: String,
    uppercase: true,
    length: 2
  }],
  planTypes: [{
    type: String,
    trim: true
  }],
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
    },
    customerService: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
    }
  },
  coverage: {
    inNetwork: {
      primaryCare: { type: Number, default: 20 },
      specialist: { type: Number, default: 40 },
      emergency: { type: Number, default: 150 },
      urgentCare: { type: Number, default: 50 },
      prescription: { type: Number, default: 10 }
    },
    outOfNetwork: {
      primaryCare: { type: Number, default: 60 },
      specialist: { type: Number, default: 100 },
      emergency: { type: Number, default: 300 },
      urgentCare: { type: Number, default: 100 },
      prescription: { type: Number, default: 30 }
    },
    deductible: {
      individual: { type: Number, default: 1500 },
      family: { type: Number, default: 3000 }
    },
    outOfPocketMax: {
      individual: { type: Number, default: 8000 },
      family: { type: Number, default: 16000 }
    }
  },
  searchKeywords: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  addedBy: {
    type: String,
    enum: ['system', 'user', 'ai'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Indexes for better search performance
InsuranceProviderSchema.index({ name: 'text', searchKeywords: 'text' });
InsuranceProviderSchema.index({ states: 1 });
InsuranceProviderSchema.index({ type: 1 });
InsuranceProviderSchema.index({ isActive: 1 });

export default mongoose.model<IInsuranceProvider>('InsuranceProvider', InsuranceProviderSchema);