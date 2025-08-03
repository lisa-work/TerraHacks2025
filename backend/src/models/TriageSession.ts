import mongoose, { Document, Schema } from 'mongoose';

export interface ITriageSession extends Document {
  user?: mongoose.Types.ObjectId;
  sessionId: string;
  symptoms: string[];
  symptomDescription: string;
  duration: string;
  severity: number; // 1-10 scale
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  patientInfo: {
    age?: number;
    gender?: string;
    medicalHistory?: string[];
    currentMedications?: string[];
    allergies?: string[];
  };
  aiAnalysis: {
    urgency: 'emergency' | 'urgent' | 'routine';
    urgencyScore: number; // 0-100
    possibleConditions: Array<{
      condition: string;
      probability: number;
      severity: string;
      description: string;
    }>;
    recommendedAction: string;
    recommendedSpecialty: string[];
    redFlags: string[];
    selfCareAdvice: string[];
    whenToSeekHelp: string[];
  };
  recommendations: {
    careType: 'emergency' | 'urgent_care' | 'primary_care' | 'specialist' | 'telemedicine' | 'self_care';
    suggestedClinics: mongoose.Types.ObjectId[];
    timeframe: string; // e.g., "immediately", "within 24 hours", "within a week"
    estimatedWaitTime: number; // in minutes
    costEstimate: {
      min: number;
      max: number;
      currency: string;
    };
  };
  followUpQuestions: Array<{
    question: string;
    answer?: string;
    importance: 'high' | 'medium' | 'low';
  }>;
  disclaimers: string[];
  confidence: number; // 0-100, AI confidence in the analysis
  processingTime: number; // in milliseconds
  isCompleted: boolean;
  userFeedback?: {
    helpful: boolean;
    accuracy: number; // 1-5 scale
    comments?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TriageSessionSchema = new Schema<ITriageSession>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: {
    type: String,
    required: [true, 'Session ID is required'],
    unique: true
  },
  symptoms: [{
    type: String,
    required: true,
    trim: true
  }],
  symptomDescription: {
    type: String,
    required: [true, 'Symptom description is required'],
    trim: true,
    maxlength: [2000, 'Symptom description cannot exceed 2000 characters']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true
  },
  severity: {
    type: Number,
    required: [true, 'Severity is required'],
    min: [1, 'Severity must be at least 1'],
    max: [10, 'Severity cannot exceed 10']
  },
  location: {
    lat: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    lng: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    address: {
      type: String,
      trim: true
    }
  },
  patientInfo: {
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
      max: [150, 'Age cannot exceed 150']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say']
    },
    medicalHistory: [{
      type: String,
      trim: true
    }],
    currentMedications: [{
      type: String,
      trim: true
    }],
    allergies: [{
      type: String,
      trim: true
    }]
  },
  aiAnalysis: {
    urgency: {
      type: String,
      required: [true, 'Urgency is required'],
      enum: ['emergency', 'urgent', 'routine']
    },
    urgencyScore: {
      type: Number,
      required: [true, 'Urgency score is required'],
      min: [0, 'Urgency score cannot be less than 0'],
      max: [100, 'Urgency score cannot exceed 100']
    },
    possibleConditions: [{
      condition: {
        type: String,
        required: true,
        trim: true
      },
      probability: {
        type: Number,
        required: true,
        min: [0, 'Probability cannot be less than 0'],
        max: [100, 'Probability cannot exceed 100']
      },
      severity: {
        type: String,
        required: true,
        enum: ['mild', 'moderate', 'severe', 'critical']
      },
      description: {
        type: String,
        required: true,
        trim: true
      }
    }],
    recommendedAction: {
      type: String,
      required: [true, 'Recommended action is required'],
      trim: true
    },
    recommendedSpecialty: [{
      type: String,
      trim: true
    }],
    redFlags: [{
      type: String,
      trim: true
    }],
    selfCareAdvice: [{
      type: String,
      trim: true
    }],
    whenToSeekHelp: [{
      type: String,
      trim: true
    }]
  },
  recommendations: {
    careType: {
      type: String,
      required: [true, 'Care type is required'],
      enum: ['emergency', 'urgent_care', 'primary_care', 'specialist', 'telemedicine', 'self_care']
    },
    suggestedClinics: [{
      type: Schema.Types.ObjectId,
      ref: 'Clinic'
    }],
    timeframe: {
      type: String,
      required: [true, 'Timeframe is required'],
      trim: true
    },
    estimatedWaitTime: {
      type: Number,
      required: [true, 'Estimated wait time is required'],
      min: [0, 'Wait time cannot be negative']
    },
    costEstimate: {
      min: {
        type: Number,
        required: true,
        min: [0, 'Cost cannot be negative']
      },
      max: {
        type: Number,
        required: true,
        min: [0, 'Cost cannot be negative']
      },
      currency: {
        type: String,
        required: true,
        default: 'USD'
      }
    }
  },
  followUpQuestions: [{
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      trim: true
    },
    importance: {
      type: String,
      required: true,
      enum: ['high', 'medium', 'low']
    }
  }],
  disclaimers: [{
    type: String,
    required: true,
    trim: true
  }],
  confidence: {
    type: Number,
    required: [true, 'Confidence is required'],
    min: [0, 'Confidence cannot be less than 0'],
    max: [100, 'Confidence cannot exceed 100']
  },
  processingTime: {
    type: Number,
    required: [true, 'Processing time is required'],
    min: [0, 'Processing time cannot be negative']
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  userFeedback: {
    helpful: Boolean,
    accuracy: {
      type: Number,
      min: [1, 'Accuracy rating must be at least 1'],
      max: [5, 'Accuracy rating cannot exceed 5']
    },
    comments: {
      type: String,
      trim: true,
      maxlength: [500, 'Comments cannot exceed 500 characters']
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
TriageSessionSchema.index({ user: 1, createdAt: -1 });
TriageSessionSchema.index({ 'aiAnalysis.urgency': 1 });
TriageSessionSchema.index({ 'recommendations.careType': 1 });
TriageSessionSchema.index({ isCompleted: 1 });
TriageSessionSchema.index({ createdAt: -1 });

// TTL index to automatically delete old sessions after 30 days
TriageSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.model<ITriageSession>('TriageSession', TriageSessionSchema);