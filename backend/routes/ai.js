const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { performAITriage, getMedicalAdvice, analyzeSymptoms } = require('../services/gemini');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// AI Triage endpoint
router.post('/triage', authenticateToken, [
  body('symptoms').isString().isLength({ min: 10 }),
  body('age').optional().isInt({ min: 0, max: 120 }),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('medicalHistory').optional().isArray(),
  body('currentMedications').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { symptoms, age, gender, medicalHistory, currentMedications } = req.body;

    // Perform AI triage
    const triageResult = await performAITriage(symptoms, null, {
      age,
      gender,
      medicalHistory,
      currentMedications
    });

    res.json({
      message: 'AI triage completed successfully',
      triage: triageResult
    });

  } catch (error) {
    console.error('AI triage error:', error);
    res.status(500).json({ 
      error: 'AI triage failed',
      message: error.message 
    });
  }
});

// Get medical advice
router.post('/medical-advice', authenticateToken, [
  body('query').isString().isLength({ min: 10 }),
  body('context').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { query, context } = req.body;

    // Get medical advice from AI
    const advice = await getMedicalAdvice(query, context);

    res.json({
      message: 'Medical advice generated successfully',
      advice
    });

  } catch (error) {
    console.error('Medical advice error:', error);
    res.status(500).json({ 
      error: 'Failed to generate medical advice',
      message: error.message 
    });
  }
});

// Analyze symptoms
router.post('/analyze-symptoms', authenticateToken, [
  body('symptoms').isArray().isLength({ min: 1 }),
  body('severity').optional().isIn(['mild', 'moderate', 'severe']),
  body('duration').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { symptoms, severity, duration } = req.body;

    // Analyze symptoms with AI
    const analysis = await analyzeSymptoms(symptoms, { severity, duration });

    res.json({
      message: 'Symptom analysis completed successfully',
      analysis
    });

  } catch (error) {
    console.error('Symptom analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze symptoms',
      message: error.message 
    });
  }
});

// Get emergency assessment
router.post('/emergency-assessment', authenticateToken, [
  body('symptoms').isString().isLength({ min: 5 }),
  body('location').optional().isObject(),
  body('vitalSigns').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { symptoms, location, vitalSigns } = req.body;

    // Perform emergency assessment
    const assessment = await performAITriage(symptoms, 'emergency', {
      location,
      vitalSigns,
      isEmergency: true
    });

    res.json({
      message: 'Emergency assessment completed',
      assessment,
      isEmergency: assessment.urgency === 'emergency'
    });

  } catch (error) {
    console.error('Emergency assessment error:', error);
    res.status(500).json({ 
      error: 'Failed to perform emergency assessment',
      message: error.message 
    });
  }
});

// Get medication information
router.post('/medication-info', authenticateToken, [
  body('medication').isString().isLength({ min: 2 }),
  body('dosage').optional().isString(),
  body('frequency').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { medication, dosage, frequency } = req.body;

    // Get medication information from AI
    const query = `Provide information about the medication: ${medication}`;
    if (dosage) query += `, dosage: ${dosage}`;
    if (frequency) query += `, frequency: ${frequency}`;

    const medicationInfo = await getMedicalAdvice(query, {
      type: 'medication',
      medication,
      dosage,
      frequency
    });

    res.json({
      message: 'Medication information retrieved successfully',
      medicationInfo
    });

  } catch (error) {
    console.error('Medication info error:', error);
    res.status(500).json({ 
      error: 'Failed to get medication information',
      message: error.message 
    });
  }
});

// Get health recommendations
router.post('/health-recommendations', authenticateToken, [
  body('age').isInt({ min: 0, max: 120 }),
  body('gender').isIn(['male', 'female', 'other']),
  body('lifestyle').optional().isObject(),
  body('medicalConditions').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { age, gender, lifestyle, medicalConditions } = req.body;

    // Generate personalized health recommendations
    const query = `Provide personalized health recommendations for a ${age}-year-old ${gender}`;
    const context = {
      type: 'recommendations',
      age,
      gender,
      lifestyle,
      medicalConditions
    };

    const recommendations = await getMedicalAdvice(query, context);

    res.json({
      message: 'Health recommendations generated successfully',
      recommendations
    });

  } catch (error) {
    console.error('Health recommendations error:', error);
    res.status(500).json({ 
      error: 'Failed to generate health recommendations',
      message: error.message 
    });
  }
});

// Get nearby emergency services
router.post('/emergency-services', authenticateToken, [
  body('location').isObject(),
  body('radius').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { location, radius = 25 } = req.body;

    // This would typically integrate with Google Maps API
    // For now, we'll return a mock response
    const emergencyServices = [
      {
        name: 'Emergency Room',
        type: 'hospital',
        distance: '2.3 km',
        phone: '911',
        address: '123 Emergency St, City, State',
        coordinates: {
          latitude: location.latitude + 0.01,
          longitude: location.longitude + 0.01
        }
      },
      {
        name: 'Urgent Care Center',
        type: 'urgent_care',
        distance: '1.8 km',
        phone: '555-0123',
        address: '456 Urgent Ave, City, State',
        coordinates: {
          latitude: location.latitude - 0.01,
          longitude: location.longitude - 0.01
        }
      }
    ];

    res.json({
      message: 'Emergency services found',
      services: emergencyServices,
      location,
      radius
    });

  } catch (error) {
    console.error('Emergency services error:', error);
    res.status(500).json({ 
      error: 'Failed to find emergency services',
      message: error.message 
    });
  }
});

// Get AI health summary
router.post('/health-summary', authenticateToken, [
  body('symptoms').isArray(),
  body('medicalHistory').optional().isArray(),
  body('currentMedications').optional().isArray(),
  body('lifestyle').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { symptoms, medicalHistory, currentMedications, lifestyle } = req.body;

    // Generate comprehensive health summary
    const summaryQuery = `Analyze the following health information and provide a comprehensive summary:
    Symptoms: ${symptoms.join(', ')}
    Medical History: ${medicalHistory ? medicalHistory.join(', ') : 'None provided'}
    Current Medications: ${currentMedications ? currentMedications.join(', ') : 'None'}
    Lifestyle: ${lifestyle ? JSON.stringify(lifestyle) : 'Not provided'}`;

    const healthSummary = await getMedicalAdvice(summaryQuery, {
      type: 'health_summary',
      symptoms,
      medicalHistory,
      currentMedications,
      lifestyle
    });

    res.json({
      message: 'Health summary generated successfully',
      summary: healthSummary
    });

  } catch (error) {
    console.error('Health summary error:', error);
    res.status(500).json({ 
      error: 'Failed to generate health summary',
      message: error.message 
    });
  }
});

// Get AI-powered diagnosis suggestions
router.post('/diagnosis-suggestions', authenticateToken, [
  body('symptoms').isArray().isLength({ min: 1 }),
  body('age').isInt({ min: 0, max: 120 }),
  body('gender').isIn(['male', 'female', 'other']),
  body('medicalHistory').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { symptoms, age, gender, medicalHistory } = req.body;

    // Get AI-powered diagnosis suggestions
    const diagnosisQuery = `Based on the following symptoms: ${symptoms.join(', ')}, 
    for a ${age}-year-old ${gender}, suggest possible diagnoses. 
    Medical history: ${medicalHistory ? medicalHistory.join(', ') : 'None provided'}`;

    const suggestions = await getMedicalAdvice(diagnosisQuery, {
      type: 'diagnosis_suggestions',
      symptoms,
      age,
      gender,
      medicalHistory
    });

    res.json({
      message: 'Diagnosis suggestions generated successfully',
      suggestions
    });

  } catch (error) {
    console.error('Diagnosis suggestions error:', error);
    res.status(500).json({ 
      error: 'Failed to generate diagnosis suggestions',
      message: error.message 
    });
  }
});

// Get treatment recommendations
router.post('/treatment-recommendations', authenticateToken, [
  body('diagnosis').isString(),
  body('symptoms').isArray(),
  body('severity').isIn(['mild', 'moderate', 'severe']),
  body('allergies').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { diagnosis, symptoms, severity, allergies } = req.body;

    // Get treatment recommendations
    const treatmentQuery = `Provide treatment recommendations for ${diagnosis} with ${severity} severity.
    Symptoms: ${symptoms.join(', ')}
    Allergies: ${allergies ? allergies.join(', ') : 'None'}`;

    const recommendations = await getMedicalAdvice(treatmentQuery, {
      type: 'treatment_recommendations',
      diagnosis,
      symptoms,
      severity,
      allergies
    });

    res.json({
      message: 'Treatment recommendations generated successfully',
      recommendations
    });

  } catch (error) {
    console.error('Treatment recommendations error:', error);
    res.status(500).json({ 
      error: 'Failed to generate treatment recommendations',
      message: error.message 
    });
  }
});

module.exports = router; 