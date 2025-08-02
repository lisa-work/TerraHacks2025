const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || 'your_gemini_key_here');

// Configure the model for medical applications
const model = genAI.getGenerativeModel({ 
  model: "gemini-pro",
  generationConfig: {
    temperature: 0.3, // Lower temperature for more consistent medical responses
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
  },
  safetySettings: [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE",
    },
  ],
});

// Medical disclaimer and context
const MEDICAL_DISCLAIMER = `
IMPORTANT: This AI system provides general information and suggestions only. 
It is not a substitute for professional medical advice, diagnosis, or treatment. 
Always consult with qualified healthcare professionals for medical concerns. 
In case of emergency, call emergency services immediately.
`;

const TRIAGE_PROMPT = `
You are an AI medical triage assistant. Your role is to:
1. Analyze symptoms and assess urgency level
2. Recommend appropriate medical care level
3. Identify potential risk factors
4. Suggest next steps for the patient

Please provide your assessment in the following JSON format:
{
  "urgency": "low|medium|high|emergency",
  "recommendedSpecialty": "string",
  "symptoms": ["array of identified symptoms"],
  "riskFactors": ["array of risk factors"],
  "aiConfidence": 0.0-1.0,
  "triageNotes": "detailed explanation",
  "recommendations": {
    "immediate": "what to do right now",
    "nextSteps": "what to do next",
    "whenToSeekCare": "when to see a doctor",
    "warningSigns": ["signs that require immediate attention"]
  }
}

${MEDICAL_DISCLAIMER}
`;

const MEDICAL_ADVICE_PROMPT = `
You are an AI medical information assistant. Provide accurate, helpful medical information while:
1. Always emphasizing the importance of consulting healthcare professionals
2. Providing evidence-based information
3. Being clear about limitations of AI advice
4. Including relevant safety warnings when appropriate

${MEDICAL_DISCLAIMER}
`;

const SYMPTOM_ANALYSIS_PROMPT = `
You are an AI symptom analysis assistant. Analyze the provided symptoms and provide:
1. Potential causes and conditions
2. Severity assessment
3. Recommended urgency level
4. Suggested medical specialties to consult

Please provide your analysis in the following JSON format:
{
  "potentialCauses": ["array of possible causes"],
  "severity": "mild|moderate|severe",
  "urgency": "low|medium|high|emergency",
  "recommendedSpecialties": ["array of medical specialties"],
  "analysis": "detailed explanation",
  "redFlags": ["warning signs to watch for"]
}

${MEDICAL_DISCLAIMER}
`;

/**
 * Perform AI triage based on symptoms
 * @param {string} symptoms - Patient symptoms description
 * @param {string} specialty - Medical specialty (optional)
 * @param {object} context - Additional context (age, gender, medical history, etc.)
 * @returns {object} Triage assessment
 */
async function performAITriage(symptoms, specialty = null, context = {}) {
  try {
    let prompt = TRIAGE_PROMPT + `\n\nPatient Symptoms: ${symptoms}`;
    
    if (specialty) {
      prompt += `\nMedical Specialty: ${specialty}`;
    }
    
    if (context.age) {
      prompt += `\nPatient Age: ${context.age}`;
    }
    
    if (context.gender) {
      prompt += `\nPatient Gender: ${context.gender}`;
    }
    
    if (context.medicalHistory && context.medicalHistory.length > 0) {
      prompt += `\nMedical History: ${context.medicalHistory.join(', ')}`;
    }
    
    if (context.currentMedications && context.currentMedications.length > 0) {
      prompt += `\nCurrent Medications: ${context.currentMedications.join(', ')}`;
    }
    
    if (context.isEmergency) {
      prompt += `\n\nEMERGENCY ASSESSMENT: This is an emergency evaluation. Please prioritize immediate safety and urgent care needs.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON response
    try {
      const triageResult = JSON.parse(text);
      return {
        ...triageResult,
        timestamp: new Date().toISOString(),
        symptoms: symptoms,
        specialty: specialty,
        context: context
      };
    } catch (parseError) {
      // If JSON parsing fails, return structured response
      return {
        urgency: 'medium',
        recommendedSpecialty: specialty || 'general',
        symptoms: [symptoms],
        riskFactors: [],
        aiConfidence: 0.5,
        triageNotes: text,
        recommendations: {
          immediate: 'Consult with a healthcare professional',
          nextSteps: 'Schedule an appointment with your doctor',
          whenToSeekCare: 'Within 24-48 hours',
          warningSigns: ['Severe pain', 'Difficulty breathing', 'Loss of consciousness']
        },
        timestamp: new Date().toISOString(),
        rawResponse: text
      };
    }
    
  } catch (error) {
    console.error('AI Triage error:', error);
    throw new Error('Failed to perform AI triage: ' + error.message);
  }
}

/**
 * Get medical advice from AI
 * @param {string} query - Medical question or query
 * @param {object} context - Additional context
 * @returns {object} Medical advice response
 */
async function getMedicalAdvice(query, context = {}) {
  try {
    let prompt = MEDICAL_ADVICE_PROMPT + `\n\nMedical Query: ${query}`;
    
    if (context.type) {
      prompt += `\nQuery Type: ${context.type}`;
    }
    
    if (context.age) {
      prompt += `\nPatient Age: ${context.age}`;
    }
    
    if (context.gender) {
      prompt += `\nPatient Gender: ${context.gender}`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return {
      advice: text,
      timestamp: new Date().toISOString(),
      query: query,
      context: context
    };
    
  } catch (error) {
    console.error('Medical advice error:', error);
    throw new Error('Failed to get medical advice: ' + error.message);
  }
}

/**
 * Analyze symptoms with AI
 * @param {Array} symptoms - Array of symptoms
 * @param {object} context - Additional context (severity, duration, etc.)
 * @returns {object} Symptom analysis
 */
async function analyzeSymptoms(symptoms, context = {}) {
  try {
    let prompt = SYMPTOM_ANALYSIS_PROMPT + `\n\nSymptoms: ${symptoms.join(', ')}`;
    
    if (context.severity) {
      prompt += `\nSeverity: ${context.severity}`;
    }
    
    if (context.duration) {
      prompt += `\nDuration: ${context.duration}`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON response
    try {
      const analysisResult = JSON.parse(text);
      return {
        ...analysisResult,
        timestamp: new Date().toISOString(),
        symptoms: symptoms,
        context: context
      };
    } catch (parseError) {
      // If JSON parsing fails, return structured response
      return {
        potentialCauses: ['Multiple possible causes'],
        severity: context.severity || 'moderate',
        urgency: 'medium',
        recommendedSpecialties: ['General Practice'],
        analysis: text,
        redFlags: ['Severe pain', 'Difficulty breathing', 'Loss of consciousness'],
        timestamp: new Date().toISOString(),
        rawResponse: text
      };
    }
    
  } catch (error) {
    console.error('Symptom analysis error:', error);
    throw new Error('Failed to analyze symptoms: ' + error.message);
  }
}

/**
 * Get medication information
 * @param {string} medication - Medication name
 * @param {object} context - Additional context
 * @returns {object} Medication information
 */
async function getMedicationInfo(medication, context = {}) {
  try {
    const query = `Provide comprehensive information about the medication: ${medication}`;
    return await getMedicalAdvice(query, {
      type: 'medication',
      medication: medication,
      ...context
    });
  } catch (error) {
    console.error('Medication info error:', error);
    throw new Error('Failed to get medication information: ' + error.message);
  }
}

/**
 * Get health recommendations
 * @param {object} profile - Patient profile (age, gender, lifestyle, etc.)
 * @returns {object} Health recommendations
 */
async function getHealthRecommendations(profile) {
  try {
    const query = `Provide personalized health recommendations for a ${profile.age}-year-old ${profile.gender}`;
    return await getMedicalAdvice(query, {
      type: 'recommendations',
      profile: profile
    });
  } catch (error) {
    console.error('Health recommendations error:', error);
    throw new Error('Failed to get health recommendations: ' + error.message);
  }
}

/**
 * Emergency assessment
 * @param {string} symptoms - Emergency symptoms
 * @param {object} context - Emergency context
 * @returns {object} Emergency assessment
 */
async function performEmergencyAssessment(symptoms, context = {}) {
  try {
    return await performAITriage(symptoms, 'emergency', {
      ...context,
      isEmergency: true
    });
  } catch (error) {
    console.error('Emergency assessment error:', error);
    throw new Error('Failed to perform emergency assessment: ' + error.message);
  }
}

/**
 * Get diagnosis suggestions
 * @param {Array} symptoms - Patient symptoms
 * @param {object} profile - Patient profile
 * @returns {object} Diagnosis suggestions
 */
async function getDiagnosisSuggestions(symptoms, profile) {
  try {
    const query = `Based on the following symptoms: ${symptoms.join(', ')}, 
    for a ${profile.age}-year-old ${profile.gender}, suggest possible diagnoses. 
    Medical history: ${profile.medicalHistory ? profile.medicalHistory.join(', ') : 'None provided'}`;
    
    return await getMedicalAdvice(query, {
      type: 'diagnosis_suggestions',
      symptoms: symptoms,
      profile: profile
    });
  } catch (error) {
    console.error('Diagnosis suggestions error:', error);
    throw new Error('Failed to get diagnosis suggestions: ' + error.message);
  }
}

/**
 * Get treatment recommendations
 * @param {string} diagnosis - Medical diagnosis
 * @param {object} context - Treatment context
 * @returns {object} Treatment recommendations
 */
async function getTreatmentRecommendations(diagnosis, context = {}) {
  try {
    const query = `Provide treatment recommendations for ${diagnosis} with ${context.severity || 'moderate'} severity.
    Symptoms: ${context.symptoms ? context.symptoms.join(', ') : 'Not specified'}
    Allergies: ${context.allergies ? context.allergies.join(', ') : 'None'}`;
    
    return await getMedicalAdvice(query, {
      type: 'treatment_recommendations',
      diagnosis: diagnosis,
      context: context
    });
  } catch (error) {
    console.error('Treatment recommendations error:', error);
    throw new Error('Failed to get treatment recommendations: ' + error.message);
  }
}

module.exports = {
  performAITriage,
  getMedicalAdvice,
  analyzeSymptoms,
  getMedicationInfo,
  getHealthRecommendations,
  performEmergencyAssessment,
  getDiagnosisSuggestions,
  getTreatmentRecommendations
}; 