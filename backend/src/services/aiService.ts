import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
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

class AIService {
  private genAI?: GoogleGenerativeAI;
  private textModel?: GenerativeModel;
  private visionModel?: GenerativeModel;
  private isConfigured = false;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY environment variable is not set. AI features will use fallback responses.');
      return;
    }

    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.textModel = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    this.visionModel = this.genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    this.isConfigured = true;
  }

  async analyzeImageWithGemini(
    imagePath: string,
    description: string = '',
    symptoms: string[] = []
  ): Promise<ImageAnalysisResult> {
    if (!this.isConfigured || !this.visionModel) {
      return this.getFallbackImageAnalysis();
    }

    try {
      // Read and encode the image
      const imageData = fs.readFileSync(imagePath);
      const base64Image = imageData.toString('base64');
      const mimeType = this.getMimeType(imagePath);

      const prompt = `
You are a medical AI assistant analyzing a medical image. Please provide a structured analysis of this image.

Image Context:
- Description: ${description}
- Related Symptoms: ${symptoms.join(', ')}

Please analyze the image and provide your assessment in the following JSON format:
{
  "confidence": number (0-100),
  "findings": ["finding1", "finding2", ...],
  "urgencyLevel": "low|medium|high|critical",
  "recommendations": ["recommendation1", "recommendation2", ...],
  "medicalTerms": ["term1", "term2", ...],
  "bodyParts": ["part1", "part2", ...]
}

Guidelines:
- Focus on visible abnormalities, injuries, skin conditions, or concerning features
- Consider the urgency based on what you observe
- Provide actionable recommendations
- Include relevant medical terminology
- Identify body parts visible in the image
- Be conservative with urgency assessment
- Always recommend professional medical evaluation for concerning findings

IMPORTANT: This analysis is for informational purposes only and should not replace professional medical diagnosis.
`;

      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: mimeType
        }
      };

      const result = await this.visionModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      return this.parseImageAnalysisResponse(text);
    } catch (error) {
      console.error('Gemini Vision API error:', error);
      return this.getFallbackImageAnalysis();
    }
  }

  async generateAIInsuranceMatch(query: string, state?: string): Promise<InsuranceProviderSuggestion | null> {
    if (!this.isConfigured || !this.textModel) {
      return this.getFallbackInsuranceProvider(query, state);
    }

    try {
      const prompt = `
You are an insurance expert AI. A user is searching for an insurance provider with the query: "${query}"${state ? ` in the state of ${state}` : ''}.

Based on your knowledge of major insurance providers in the US, please suggest a matching insurance provider and provide realistic coverage information.

Please respond in the following JSON format:
{
  "name": "Full provider name",
  "type": "health",
  "networks": ["network1", "network2"],
  "states": ["${state || 'CA'}", "NY", "TX"],
  "planTypes": ["HMO", "PPO", "EPO"],
  "contactInfo": {
    "phone": "1-800-XXX-XXXX",
    "website": "https://www.provider.com",
    "customerService": "1-800-XXX-XXXX"
  },
  "coverage": {
    "inNetwork": {
      "primaryCare": 25,
      "specialist": 50,
      "emergency": 200,
      "urgentCare": 75,
      "prescription": 15
    },
    "outOfNetwork": {
      "primaryCare": 75,
      "specialist": 125,
      "emergency": 400,
      "urgentCare": 150,
      "prescription": 40
    },
    "deductible": {
      "individual": 1500,
      "family": 3000
    },
    "outOfPocketMax": {
      "individual": 8000,
      "family": 16000
    }
  },
  "searchKeywords": ["keyword1", "keyword2", "keyword3"]
}

Make sure to:
- Use realistic coverage amounts typical for that provider
- Include common search variations in keywords
- Provide accurate contact information if you know it
- Only suggest real, major insurance providers
- Include the query term in searchKeywords
`;

      const result = await this.textModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseInsuranceResponse(text, query);
    } catch (error) {
      console.error('Gemini Insurance API error:', error);
      return this.getFallbackInsuranceProvider(query, state);
    }
  }

  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'image/jpeg';
  }

  private parseImageAnalysisResponse(text: string): ImageAnalysisResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          confidence: Math.min(100, Math.max(0, parsed.confidence || 70)),
          findings: Array.isArray(parsed.findings) ? parsed.findings : [],
          urgencyLevel: this.validateUrgencyLevel(parsed.urgencyLevel),
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
          medicalTerms: Array.isArray(parsed.medicalTerms) ? parsed.medicalTerms : [],
          bodyParts: Array.isArray(parsed.bodyParts) ? parsed.bodyParts : [],
          model: 'gemini-pro-vision'
        };
      }
    } catch (error) {
      console.error('Failed to parse image analysis response:', error);
    }

    return this.getFallbackImageAnalysis();
  }

  private parseInsuranceResponse(text: string, query: string): InsuranceProviderSuggestion | null {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Ensure searchKeywords includes the original query
        if (!parsed.searchKeywords.includes(query.toLowerCase())) {
          parsed.searchKeywords.push(query.toLowerCase());
        }

        return parsed;
      }
    } catch (error) {
      console.error('Failed to parse insurance response:', error);
    }

    return null;
  }

  private validateUrgencyLevel(level: string): 'low' | 'medium' | 'high' | 'critical' {
    const validLevels = ['low', 'medium', 'high', 'critical'];
    return validLevels.includes(level) ? level as any : 'medium';
  }

  private getFallbackImageAnalysis(): ImageAnalysisResult {
    return {
      confidence: 60,
      findings: ['Image uploaded successfully', 'Professional medical evaluation recommended'],
      urgencyLevel: 'medium',
      recommendations: [
        'Consult with a healthcare professional for proper evaluation',
        'Monitor symptoms and seek immediate care if they worsen',
        'Keep the affected area clean and protected'
      ],
      medicalTerms: ['medical evaluation', 'clinical assessment'],
      bodyParts: ['general'],
      model: 'fallback'
    };
  }

  private getFallbackInsuranceProvider(query: string, state?: string): InsuranceProviderSuggestion {
    // Create a reasonable fallback based on the query
    const providerName = this.generateProviderNameFromQuery(query);
    
    return {
      name: providerName,
      type: 'health',
      networks: ['National Network', 'Regional Network'],
      states: state ? [state.toUpperCase()] : ['CA', 'NY', 'TX', 'FL'],
      planTypes: ['HMO', 'PPO', 'EPO'],
      contactInfo: {
        phone: '1-800-555-0123',
        website: `https://www.${providerName.toLowerCase().replace(/\s+/g, '')}.com`,
        customerService: '1-800-555-0124'
      },
      coverage: {
        inNetwork: {
          primaryCare: 25,
          specialist: 50,
          emergency: 200,
          urgentCare: 75,
          prescription: 15
        },
        outOfNetwork: {
          primaryCare: 75,
          specialist: 125,
          emergency: 400,
          urgentCare: 150,
          prescription: 40
        },
        deductible: {
          individual: 1500,
          family: 3000
        },
        outOfPocketMax: {
          individual: 8000,
          family: 16000
        }
      },
      searchKeywords: [
        query.toLowerCase(),
        providerName.toLowerCase(),
        'health insurance',
        'medical coverage'
      ]
    };
  }

  private generateProviderNameFromQuery(query: string): string {
    // Simple logic to generate a plausible provider name
    const commonProviders = [
      'Blue Cross Blue Shield',
      'Aetna',
      'Cigna',
      'UnitedHealth',
      'Humana',
      'Kaiser Permanente',
      'Anthem'
    ];

    // Check if query matches any known provider
    for (const provider of commonProviders) {
      if (provider.toLowerCase().includes(query.toLowerCase()) || 
          query.toLowerCase().includes(provider.toLowerCase().split(' ')[0])) {
        return provider;
      }
    }

    // If no match, create a generic name
    return `${query} Health Insurance`;
  }
}

// Export singleton instance
const aiService = new AIService();

export const analyzeImageWithGemini = (imagePath: string, description?: string, symptoms?: string[]) =>
  aiService.analyzeImageWithGemini(imagePath, description, symptoms);

export const generateAIInsuranceMatch = (query: string, state?: string) =>
  aiService.generateAIInsuranceMatch(query, state);

export default aiService;