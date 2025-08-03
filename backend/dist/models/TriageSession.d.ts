import mongoose, { Document } from 'mongoose';
export interface ITriageSession extends Document {
    user?: mongoose.Types.ObjectId;
    sessionId: string;
    symptoms: string[];
    symptomDescription: string;
    duration: string;
    severity: number;
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
        urgencyScore: number;
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
        timeframe: string;
        estimatedWaitTime: number;
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
    confidence: number;
    processingTime: number;
    isCompleted: boolean;
    userFeedback?: {
        helpful: boolean;
        accuracy: number;
        comments?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ITriageSession, {}, {}, {}, mongoose.Document<unknown, {}, ITriageSession, {}, {}> & ITriageSession & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=TriageSession.d.ts.map