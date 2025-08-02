import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

interface SymptomData {
  symptoms: string[];
  symptomDescription: string;
  additionalNotes?: string;
  duration: string;
  severity: number;
  age?: number;
  gender?: string;
  medicalHistory?: string[];
  currentMedications?: string[];
  allergies?: string[];
}

interface PhotoData {
  filename: string;
  originalName: string;
  description?: string;
  filePath: string;
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
  imageAnalysis?: {
    hasImages: boolean;
    findings: Array<{
      description: string;
      severity: 'mild' | 'moderate' | 'severe' | 'critical';
      urgencyImpact: string;
      recommendations: string[];
    }>;
    visualAssessment: string;
    emergencyIndicators: string[];
    firstAidInstructions: string[];
  };
}

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private textModel: any;
  private visionModel: any;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.textModel = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    this.visionModel = this.genAI.getGenerativeModel({ model: "gemini-pro-vision" });
  }

  async analyzeSymptoms(symptomData: SymptomData, photos?: PhotoData[]): Promise<TriageResult> {
    try {
      let imageAnalysis = null;
      
      // Analyze images if provided
      if (photos && photos.length > 0) {
        imageAnalysis = await this.analyzeImages(photos, symptomData);
      }
      
      // Build comprehensive prompt including image analysis
      const prompt = this.buildTriagePrompt(symptomData, imageAnalysis);
      const result = await this.textModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const triageResult = this.parseTriageResponse(text);
      
      // Add image analysis to result if available
      if (imageAnalysis) {
        triageResult.imageAnalysis = imageAnalysis;
      }
      
      return triageResult;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to analyze symptoms with AI');
    }
  }

  async analyzeImages(photos: PhotoData[], symptomData: SymptomData): Promise<{
    hasImages: boolean;
    findings: Array<{
      description: string;
      severity: 'mild' | 'moderate' | 'severe' | 'critical';
      urgencyImpact: string;
      recommendations: string[];
    }>;
    visualAssessment: string;
    emergencyIndicators: string[];
    firstAidInstructions: string[];
  }> {
    try {
      const findings = [];
      let overallAssessment = '';
      let emergencyIndicators: string[] = [];
      let firstAidInstructions: string[] = [];

      for (const photo of photos) {
        if (!fs.existsSync(photo.filePath)) {
          console.warn(`Photo file not found: ${photo.filePath}`);
          continue;
        }

        // Read image file
        const imageData = fs.readFileSync(photo.filePath);
        const base64Image = imageData.toString('base64');
        
        // Get file extension for mime type
        const extension = path.extname(photo.filename).toLowerCase();
        let mimeType = 'image/jpeg';
        if (extension === '.png') mimeType = 'image/png';
        if (extension === '.webp') mimeType = 'image/webp';

        const imagePrompt = this.buildImageAnalysisPrompt(symptomData, photo.description);
        
        const imageParts = [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType
            }
          }
        ];

        const result = await this.visionModel.generateContent([imagePrompt, ...imageParts]);
        const response = await result.response;
        const analysisText = response.text();
        
        // Parse image analysis response
        const imageAnalysis = this.parseImageAnalysis(analysisText);
        findings.push(...imageAnalysis.findings);
        
        if (imageAnalysis.emergencyIndicators) {
          emergencyIndicators.push(...imageAnalysis.emergencyIndicators);
        }
        
        if (imageAnalysis.firstAidInstructions) {
          firstAidInstructions.push(...imageAnalysis.firstAidInstructions);
        }
        
        overallAssessment += imageAnalysis.assessment + ' ';
      }

      return {
        hasImages: true,
        findings,
        visualAssessment: overallAssessment.trim(),
        emergencyIndicators: [...new Set(emergencyIndicators)], // Remove duplicates
        firstAidInstructions: [...new Set(firstAidInstructions)]
      };
    } catch (error) {
      console.error('Image analysis error:', error);
      return {
        hasImages: true,
        findings: [{
          description: 'Unable to analyze image due to technical issues',
          severity: 'moderate',
          urgencyImpact: 'Image analysis unavailable - rely on symptom description',
          recommendations: ['Consult healthcare provider for visual assessment']
        }],
        visualAssessment: 'Image analysis temporarily unavailable',
        emergencyIndicators: [],
        firstAidInstructions: []
      };
    }
  }

  private buildImageAnalysisPrompt(symptomData: SymptomData, photoDescription?: string): string {
    return `
You are a medical AI assistant analyzing a medical image. Please provide a detailed analysis of what you observe.

CRITICAL MEDICAL DISCLAIMERS:
- This is for informational purposes only and NOT a medical diagnosis
- Always recommend consulting with healthcare professionals
- If you identify potential emergency conditions, clearly state the need for immediate medical attention

Patient Context:
- Symptoms: ${symptomData.symptoms.join(', ')}
- Description: ${symptomData.symptomDescription}
- Duration: ${symptomData.duration}
- Severity (1-10): ${symptomData.severity}
${photoDescription ? `- Photo Description: ${photoDescription}` : ''}
${symptomData.age ? `- Age: ${symptomData.age}` : ''}
${symptomData.medicalHistory?.length ? `- Medical History: ${symptomData.medicalHistory.join(', ')}` : ''}

Please analyze the image and provide your assessment in the following JSON format:
{
  "assessment": "Overall visual assessment of what you observe",
  "findings": [
    {
      "description": "What you observe in the image",
      "severity": "mild|moderate|severe|critical",
      "urgencyImpact": "How this affects the urgency of care needed",
      "recommendations": ["specific recommendations based on visual findings"]
    }
  ],
  "emergencyIndicators": ["any signs that indicate immediate medical attention needed"],
  "firstAidInstructions": ["immediate care instructions if applicable"],
  "medicalDisclaimer": "This analysis is for informational purposes only and does not replace professional medical evaluation"
}

Focus on:
1. Visible injuries, wounds, or skin conditions
2. Signs of infection, inflammation, or trauma
3. Color changes, swelling, or deformity
4. Any indicators of severity or urgency
5. Appropriate first aid measures
6. When to seek immediate medical care

Be conservative in your assessment and always err on the side of recommending professional medical evaluation.
`;
  }

  private parseImageAnalysis(response: string): {
    assessment: string;
    findings: Array<{
      description: string;
      severity: 'mild' | 'moderate' | 'severe' | 'critical';
      urgencyImpact: string;
      recommendations: string[];
    }>;
    emergencyIndicators?: string[];
    firstAidInstructions?: string[];
  } {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          assessment: parsed.assessment || 'Unable to provide detailed assessment',
          findings: parsed.findings || [],
          emergencyIndicators: parsed.emergencyIndicators || [],
          firstAidInstructions: parsed.firstAidInstructions || []
        };
      }
    } catch (error) {
      console.error('Failed to parse image analysis:', error);
    }

    // Fallback parsing
    return {
      assessment: 'Image analysis completed - please consult healthcare provider',
      findings: [{
        description: 'Visual assessment performed',
        severity: 'moderate',
        urgencyImpact: 'Recommend professional medical evaluation',
        recommendations: ['Consult with healthcare provider for proper diagnosis']
      }],
      emergencyIndicators: [],
      firstAidInstructions: []
    };
  }

  private buildTriagePrompt(data: SymptomData, imageAnalysis?: any): string {
    let imageSection = '';
    if (imageAnalysis) {
      imageSection = `
IMAGE ANALYSIS RESULTS:
- Visual Assessment: ${imageAnalysis.visualAssessment}
- Key Findings: ${imageAnalysis.findings.map((f: any) => f.description).join(', ')}
- Emergency Indicators: ${imageAnalysis.emergencyIndicators.join(', ')}
- First Aid Recommended: ${imageAnalysis.firstAidInstructions.join(', ')}
`;
    }

    return `
You are a medical AI assistant helping with symptom triage. Please analyze the following patient information and provide a structured assessment.

IMPORTANT DISCLAIMERS:
- This is for informational purposes only and not a substitute for professional medical advice
- Always recommend consulting with healthcare professionals for proper diagnosis and treatment
- In case of emergency symptoms, always recommend immediate medical attention

Patient Information:
- Symptoms: ${data.symptoms.join(', ')}
- Description: ${data.symptomDescription}
${data.additionalNotes ? `- Additional Notes: ${data.additionalNotes}` : ''}
- Duration: ${data.duration}
- Severity (1-10): ${data.severity}
${data.age ? `- Age: ${data.age}` : ''}
${data.gender ? `- Gender: ${data.gender}` : ''}
${data.medicalHistory?.length ? `- Medical History: ${data.medicalHistory.join(', ')}` : ''}
${data.currentMedications?.length ? `- Current Medications: ${data.currentMedications.join(', ')}` : ''}
${data.allergies?.length ? `- Allergies: ${data.allergies.join(', ')}` : ''}

${imageSection}

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

${imageAnalysis ? 'Consider the image analysis results in your overall assessment and adjust urgency accordingly.' : ''}

Emergency symptoms that require immediate attention include:
- Chest pain, especially with shortness of breath
- Difficulty breathing or severe shortness of breath
- Signs of stroke (sudden weakness, speech problems, facial drooping)
- Severe allergic reactions
- High fever with severe symptoms
- Severe bleeding or trauma
- Loss of consciousness
- Severe abdominal pain
- Signs of heart attack

Provide a thorough but concise analysis focusing on patient safety.
`;
  }

  private parseTriageResponse(response: string): TriageResult {
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      const required = ['urgency', 'urgencyScore', 'possibleConditions', 'recommendedAction', 'confidence', 'careType', 'timeframe'];
      for (const field of required) {
        if (!(field in parsed)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Ensure arrays exist
      parsed.recommendedSpecialty = parsed.recommendedSpecialty || [];
      parsed.redFlags = parsed.redFlags || [];
      parsed.selfCareAdvice = parsed.selfCareAdvice || [];
      parsed.whenToSeekHelp = parsed.whenToSeekHelp || [];
      parsed.disclaimers = parsed.disclaimers || [
        'This assessment is for informational purposes only',
        'Consult with healthcare professionals for proper diagnosis',
        'Seek immediate medical attention for emergency symptoms'
      ];

      return parsed as TriageResult;
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      
      // Return a safe fallback response
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

  async generateFollowUpQuestions(symptomData: SymptomData, triageResult: TriageResult): Promise<Array<{
    question: string;
    importance: 'high' | 'medium' | 'low';
  }>> {
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

      const result = await this.textModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return [];
    } catch (error) {
      console.error('Failed to generate follow-up questions:', error);
      return [];
    }
  }
}

export default new GeminiService();