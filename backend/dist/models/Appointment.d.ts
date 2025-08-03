import mongoose, { Document } from 'mongoose';
export interface IAppointment extends Document {
    user: mongoose.Types.ObjectId;
    clinic: mongoose.Types.ObjectId;
    appointmentDate: Date;
    appointmentTime: string;
    duration: number;
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
    waitTime?: number;
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
declare const _default: mongoose.Model<IAppointment, {}, {}, {}, mongoose.Document<unknown, {}, IAppointment, {}, {}> & IAppointment & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Appointment.d.ts.map