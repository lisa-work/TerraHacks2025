import mongoose, { Document } from 'mongoose';
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
        height?: number;
        weight?: number;
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
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map