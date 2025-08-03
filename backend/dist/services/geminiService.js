"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generative_ai_1 = require("@google/generative-ai");
require("../config/env");
class GeminiService {
    constructor() {
        this.isConfigured = false;
        if (!process.env.GEMINI_API_KEY) {
            console.warn('GEMINI_API_KEY environment variable is not set. Using fallback responses.');
            return;
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
        this.isConfigured = true;
    }
    async analyzeSymptoms(symptomData) {
        if (!this.isConfigured || !this.model) {
            return this.getFallbackResult();
        }
        try {
            const prompt = this.buildTriagePrompt(symptomData);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            return this.parseTriageResponse(text);
        }
        catch (error) {
            console.error('Gemini API error:', error);
            return this.getFallbackResult();
        }
    }
    buildTriagePrompt(data) {
        return `
You are a medical AI assistant helping with symptom triage. Please analyze the following patient information and provide a structured assessment.

IMPORTANT DISCLAIMERS:
- This is for informational purposes only and not a substitute for professional medical advice
- Always recommend consulting with healthcare professionals for proper diagnosis and treatment
- In case of emergency symptoms, always recommend immediate medical attention

Patient Information:
- Symptoms: ${data.symptoms.join(', ')}
- Description: ${data.symptomDescription}
- Duration: ${data.duration}
- Severity (1-10): ${data.severity}
${data.age ? `- Age: ${data.age}` : ''}
${data.gender ? `- Gender: ${data.gender}` : ''}
${data.medicalHistory?.length ? `- Medical History: ${data.medicalHistory.join(', ')}` : ''}
${data.currentMedications?.length ? `- Current Medications: ${data.currentMedications.join(', ')}` : ''}
${data.allergies?.length ? `- Allergies: ${data.allergies.join(', ')}` : ''}

Please provide your assessment in the following JSON format:
{
  "urgency": "emergency|urgent|routine",
  "urgencyScore": number (0-100),
  "possibleConditions": [
    {
      "condition": "condition name",
      "probability": number (0-100),
      "severity": "mild|moderate|severe|critical",
      "description": "brief description"
    }
  ],
  "recommendedAction": "primary recommendation",
  "recommendedSpecialty": ["specialty1", "specialty2"],
  "redFlags": ["warning sign 1", "warning sign 2"],
  "selfCareAdvice": ["advice 1", "advice 2"],
  "whenToSeekHelp": ["when to seek immediate help"],
  "confidence": number (0-100),
  "careType": "emergency|urgent_care|primary_care|specialist|telemedicine|self_care",
  "timeframe": "when to seek care",
  "disclaimers": [
    "This assessment is for informational purposes only",
    "Consult with healthcare professionals for proper diagnosis",
    "Seek immediate medical attention for emergency symptoms"
  ]
}

Emergency symptoms that require immediate attention include:
- Chest pain, especially with shortness of breath
- Difficulty breathing or severe shortness of breath
- Signs of stroke (sudden weakness, speech problems, facial drooping)
- Severe allergic reactions
- High fever with severe symptoms
- Severe bleeding
- Loss of consciousness
- Severe abdominal pain
- Signs of heart attack

Provide a thorough but concise analysis focusing on patient safety.
`;
    }
    parseTriageResponse(response) {
        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            const parsed = JSON.parse(jsonMatch[0]);
            const required = ['urgency', 'urgencyScore', 'possibleConditions', 'recommendedAction', 'confidence', 'careType', 'timeframe'];
            for (const field of required) {
                if (!(field in parsed)) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }
            parsed.recommendedSpecialty = parsed.recommendedSpecialty || [];
            parsed.redFlags = parsed.redFlags || [];
            parsed.selfCareAdvice = parsed.selfCareAdvice || [];
            parsed.whenToSeekHelp = parsed.whenToSeekHelp || [];
            parsed.disclaimers = parsed.disclaimers || [
                'This assessment is for informational purposes only',
                'Consult with healthcare professionals for proper diagnosis',
                'Seek immediate medical attention for emergency symptoms'
            ];
            return parsed;
        }
        catch (error) {
            console.error('Failed to parse Gemini response:', error);
            return {
                urgency: 'urgent',
                urgencyScore: 70,
                possibleConditions: [
                    {
                        condition: 'Unable to determine',
                        probability: 50,
                        severity: 'moderate',
                        description: 'AI analysis was inconclusive. Please consult with a healthcare professional.'
                    }
                ],
                recommendedAction: 'Consult with a healthcare professional for proper evaluation',
                recommendedSpecialty: ['General Medicine'],
                redFlags: ['Any worsening of symptoms'],
                selfCareAdvice: ['Monitor symptoms closely', 'Rest and stay hydrated'],
                whenToSeekHelp: ['If symptoms worsen or persist'],
                confidence: 30,
                careType: 'primary_care',
                timeframe: 'within 24-48 hours',
                disclaimers: [
                    'This assessment is for informational purposes only',
                    'AI analysis was inconclusive - please consult with healthcare professionals',
                    'Seek immediate medical attention if symptoms worsen'
                ]
            };
        }
    }
    getFallbackResult() {
        return {
            urgency: 'urgent',
            urgencyScore: 70,
            possibleConditions: [
                {
                    condition: 'Unable to determine',
                    probability: 50,
                    severity: 'moderate',
                    description: 'AI analysis was inconclusive. Please consult with a healthcare professional.'
                }
            ],
            recommendedAction: 'Consult with a healthcare professional for proper evaluation',
            recommendedSpecialty: ['General Medicine'],
            redFlags: ['Any worsening of symptoms'],
            selfCareAdvice: ['Monitor symptoms closely', 'Rest and stay hydrated'],
            whenToSeekHelp: ['If symptoms worsen or persist'],
            confidence: 30,
            careType: 'primary_care',
            timeframe: 'within 24-48 hours',
            disclaimers: [
                'This assessment is for informational purposes only',
                'AI analysis was inconclusive - please consult with healthcare professionals',
                'Seek immediate medical attention if symptoms worsen'
            ]
        };
    }
    async generateFollowUpQuestions(symptomData, triageResult) {
        if (!this.isConfigured || !this.model) {
            return [];
        }
        try {
            const prompt = `
Based on the following symptom analysis, generate 3-5 relevant follow-up questions to gather more information:

Symptoms: ${symptomData.symptoms.join(', ')}
Description: ${symptomData.symptomDescription}
Urgency: ${triageResult.urgency}
Possible Conditions: ${triageResult.possibleConditions.map(c => c.condition).join(', ')}

Generate questions that would help clarify the diagnosis or urgency. Return as JSON array:
[
  {
    "question": "question text",
    "importance": "high|medium|low"
  }
]
`;
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return [];
        }
        catch (error) {
            console.error('Failed to generate follow-up questions:', error);
            return [];
        }
    }
}
exports.default = new GeminiService();
//# sourceMappingURL=geminiService.js.map