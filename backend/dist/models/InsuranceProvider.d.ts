import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IInsuranceProvider, {}, {}, {}, mongoose.Document<unknown, {}, IInsuranceProvider, {}, {}> & IInsuranceProvider & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=InsuranceProvider.d.ts.map