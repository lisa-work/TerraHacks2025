import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IUploadedImage, {}, {}, {}, mongoose.Document<unknown, {}, IUploadedImage, {}, {}> & IUploadedImage & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=UploadedImage.d.ts.map