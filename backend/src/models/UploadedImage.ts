import mongoose, { Document, Schema } from 'mongoose';

export interface IUploadedImage extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  aiAnalysis?: {
    analyzed: boolean;
    confidence: number;
    findings: string[];
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
    medicalTerms: string[];
    bodyParts: string[];
    analysisDate: Date;
    model: string;
  };
  relatedSymptoms: string[];
  triageSessionId?: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UploadedImageSchema = new Schema<IUploadedImage>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  originalName: {
    type: String,
    required: [true, 'Original file name is required'],
    trim: true
  },
  filePath: {
    type: String,
    required: [true, 'File path is required'],
    trim: true
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required'],
    enum: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  aiAnalysis: {
    analyzed: {
      type: Boolean,
      default: false
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    findings: [{
      type: String,
      trim: true
    }],
    urgencyLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    recommendations: [{
      type: String,
      trim: true
    }],
    medicalTerms: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    bodyParts: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    analysisDate: Date,
    model: {
      type: String,
      trim: true
    }
  },
  relatedSymptoms: [{
    type: String,
    trim: true
  }],
  triageSessionId: {
    type: Schema.Types.ObjectId,
    ref: 'TriageSession'
  },
  appointmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better performance
UploadedImageSchema.index({ userId: 1, createdAt: -1 });
UploadedImageSchema.index({ triageSessionId: 1 });
UploadedImageSchema.index({ appointmentId: 1 });
UploadedImageSchema.index({ 'aiAnalysis.urgencyLevel': 1 });
UploadedImageSchema.index({ isDeleted: 1 });

export default mongoose.model<IUploadedImage>('UploadedImage', UploadedImageSchema);