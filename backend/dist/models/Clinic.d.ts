import mongoose, { Document } from 'mongoose';
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
        emergency: number;
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
declare const _default: mongoose.Model<IClinic, {}, {}, {}, mongoose.Document<unknown, {}, IClinic, {}, {}> & IClinic & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Clinic.d.ts.map