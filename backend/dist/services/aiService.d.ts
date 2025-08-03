import '../config/env';
interface ImageAnalysisResult {
    confidence: number;
    findings: string[];
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendations: string[];
    medicalTerms: string[];
    bodyParts: string[];
    model: string;
}
interface InsuranceProviderSuggestion {
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
}
declare class AIService {
    private genAI?;
    private textModel?;
    private visionModel?;
    private isConfigured;
    constructor();
    analyzeImageWithGemini(imagePath: string, description?: string, symptoms?: string[]): Promise<ImageAnalysisResult>;
    generateAIInsuranceMatch(query: string, state?: string): Promise<InsuranceProviderSuggestion | null>;
    private getMimeType;
    private parseImageAnalysisResponse;
    private parseInsuranceResponse;
    private validateUrgencyLevel;
    private getFallbackImageAnalysis;
    private getFallbackInsuranceProvider;
    private generateProviderNameFromQuery;
}
declare const aiService: AIService;
export declare const analyzeImageWithGemini: (imagePath: string, description?: string, symptoms?: string[]) => Promise<ImageAnalysisResult>;
export declare const generateAIInsuranceMatch: (query: string, state?: string) => Promise<InsuranceProviderSuggestion | null>;
export default aiService;
//# sourceMappingURL=aiService.d.ts.map