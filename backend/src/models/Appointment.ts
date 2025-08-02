import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  user: mongoose.Types.ObjectId;
  clinic: mongoose.Types.ObjectId;
  appointmentDate: Date;
  appointmentTime: string;
  duration: number; // in minutes
  type: 'consultation' | 'follow_up' | 'emergency' | 'specialist' | 'telemedicine' | 'routine_checkup';
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  symptoms: string[];
  notes?: string;
  doctorNotes?: string;
  assignedDoctor?: {
    name: string;
    specialty: string;
    contactInfo: string;
  };
  estimatedCost: number;
  actualCost?: number;
  insuranceCoverage: {
    provider: string;
    coveragePercentage: number;
    copay: number;
    deductible: number;
  };
  paymentStatus: 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'insurance_pending';
  remindersSent: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  checkInTime?: Date;
  checkOutTime?: Date;
  waitTime?: number; // in minutes
  prescriptions?: Array<{
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  followUpRequired: boolean;
  followUpDate?: Date;
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  clinic: {
    type: Schema.Types.ObjectId,
    ref: 'Clinic',
    required: [true, 'Clinic is required']
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Appointment date is required'],
    validate: {
      validator: function(value: Date) {
        return value > new Date();
      },
      message: 'Appointment date must be in the future'
    }
  },
  appointmentTime: {
    type: String,
    required: [true, 'Appointment time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time format (HH:MM)']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [15, 'Duration must be at least 15 minutes'],
    max: [480, 'Duration cannot exceed 8 hours']
  },
  type: {
    type: String,
    required: [true, 'Appointment type is required'],
    enum: ['consultation', 'follow_up', 'emergency', 'specialist', 'telemedicine', 'routine_checkup']
  },
  status: {
    type: String,
    default: 'scheduled',
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled']
  },
  priority: {
    type: String,
    default: 'medium',
    enum: ['low', 'medium', 'high', 'emergency']
  },
  symptoms: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  doctorNotes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Doctor notes cannot exceed 2000 characters']
  },
  assignedDoctor: {
    name: {
      type: String,
      trim: true
    },
    specialty: {
      type: String,
      trim: true
    },
    contactInfo: {
      type: String,
      trim: true
    }
  },
  estimatedCost: {
    type: Number,
    required: [true, 'Estimated cost is required'],
    min: [0, 'Cost cannot be negative']
  },
  actualCost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },
  insuranceCoverage: {
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
    },
    copay: {
      type: Number,
      required: true,
      min: [0, 'Copay cannot be negative']
    },
    deductible: {
      type: Number,
      required: true,
      min: [0, 'Deductible cannot be negative']
    }
  },
  paymentStatus: {
    type: String,
    default: 'pending',
    enum: ['pending', 'paid', 'partially_paid', 'refunded', 'insurance_pending']
  },
  remindersSent: {
    email: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: false
    }
  },
  checkInTime: Date,
  checkOutTime: Date,
  waitTime: {
    type: Number,
    min: [0, 'Wait time cannot be negative']
  },
  prescriptions: [{
    medication: {
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
    duration: {
      type: String,
      required: true,
      trim: true
    },
    instructions: {
      type: String,
      trim: true
    }
  }],
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date,
    validate: {
      validator: function(value: Date) {
        return !value || value > new Date();
      },
      message: 'Follow-up date must be in the future'
    }
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  review: {
    type: String,
    trim: true,
    maxlength: [500, 'Review cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes for better performance
AppointmentSchema.index({ user: 1, appointmentDate: 1 });
AppointmentSchema.index({ clinic: 1, appointmentDate: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ appointmentDate: 1, appointmentTime: 1 });
AppointmentSchema.index({ type: 1 });
AppointmentSchema.index({ priority: 1 });
AppointmentSchema.index({ createdAt: -1 });

// Compound index for availability checking
AppointmentSchema.index({ 
  clinic: 1, 
  appointmentDate: 1, 
  appointmentTime: 1, 
  status: 1 
});

// Virtual for full appointment datetime
AppointmentSchema.virtual('fullDateTime').get(function() {
  const dateStr = this.appointmentDate.toISOString().split('T')[0];
  return new Date(`${dateStr}T${this.appointmentTime}:00`);
});

// Pre-save middleware to calculate wait time if check-in and check-out times are available
AppointmentSchema.pre('save', function(next) {
  if (this.checkInTime && this.checkOutTime) {
    this.waitTime = Math.round((this.checkOutTime.getTime() - this.checkInTime.getTime()) / (1000 * 60));
  }
  next();
});

export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);