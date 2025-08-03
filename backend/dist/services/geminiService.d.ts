interface SymptomData {
    symptoms: string[];
    symptomDescription: string;
    duration: string;
    severity: number;
    age?: number;
    gender?: string;
    medicalHistory?: string[];
    currentMedications?: string[];
    allergies?: string[];
}
interface TriageResult {
    urgency: 'emergency' | 'urgent' | 'routine';
    urgencyScore: number;
    possibleConditions: Array<{
        condition: string;
        probability: number;
        severity: 'mild' | 'moderate' | 'severe' | 'critical';
        description: string;
    }>;
    recommendedAction: string;
    recommendedSpecialty: string[];
    redFlags: string[];
    selfCareAdvice: string[];
    whenToSeekHelp: string[];
    confidence: number;
    careType: 'emergency' | 'urgent_care' | 'primary_care' | 'specialist' | 'telemedicine' | 'self_care';
    timeframe: string;
    disclaimers: string[];
}
declare class GeminiService {
    private genAI?;
    private model?;
    private isConfigured;
    constructor();
    analyzeSymptoms(symptomData: SymptomData): Promise<TriageResult>;
    private buildTriagePrompt;
    private parseTriageResponse;
    private getFallbackResult;
    generateFollowUpQuestions(symptomData: SymptomData, triageResult: TriageResult): Promise<Array<{
        question: string;
        importance: 'high' | 'medium' | 'low';
    }>>;
}
declare const _default: GeminiService;
export default _default;
//# sourceMappingURL=geminiService.d.ts.map