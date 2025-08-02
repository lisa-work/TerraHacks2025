import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import TriageSession from '../models/TriageSession';
import User from '../models/User';
import Clinic from '../models/Clinic';
import geminiService from '../services/geminiService';
import mapsService from '../services/mapsService';
import { AuthRequest } from '../middleware/auth';
import { setCache, getCache } from '../config/redis';
import { deleteUploadedFiles, getFileUrl } from '../middleware/upload';

// @desc    Start new triage session with photo support
// @route   POST /api/triage/start
// @access  Public (can be used without auth)
export const startTriageSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      symptoms,
      symptomDescription,
      additionalNotes,
      duration,
      severity,
      location,
      patientInfo
    } = req.body;

    const sessionId = uuidv4();
    const startTime = Date.now();

    // Handle uploaded photos
    const uploadedFiles = req.files as Express.Multer.File[] || [];
    const photos = uploadedFiles.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
      description: req.body[`photo_description_${file.fieldname}`] || undefined
    }));

    // Get user's medical history if authenticated
    let medicalHistory: string[] = [];
    let currentMedications: string[] = [];
    let allergies: string[] = [];

    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        medicalHistory = user.medicalHistory.conditions.map(c => c.name);
        currentMedications = user.medicalHistory.medications.map(m => m.name);
        allergies = user.medicalHistory.allergies;
      }
    }

    // Prepare symptom data for AI analysis
    const symptomData = {
      symptoms,
      symptomDescription,
      additionalNotes,
      duration,
      severity,
      age: patientInfo?.age || (req.user?.dateOfBirth ? 
        new Date().getFullYear() - new Date(req.user.dateOfBirth).getFullYear() : undefined),
      gender: patientInfo?.gender || req.user?.gender,
      medicalHistory: [...medicalHistory, ...(patientInfo?.medicalHistory || [])],
      currentMedications: [...currentMedications, ...(patientInfo?.currentMedications || [])],
      allergies: [...allergies, ...(patientInfo?.allergies || [])]
    };

    // Prepare photo data for AI analysis
    const photoData = uploadedFiles.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      description: req.body[`photo_description_${file.fieldname}`],
      filePath: file.path
    }));

    try {
      // Analyze symptoms with Gemini AI (including photos if provided)
      const aiAnalysis = await geminiService.analyzeSymptoms(symptomData, photoData.length > 0 ? photoData : undefined);
      const processingTime = Date.now() - startTime;

      // Generate follow-up questions
      const followUpQuestions = await geminiService.generateFollowUpQuestions(symptomData, aiAnalysis);

      // Find nearby clinics based on care type and location
      let suggestedClinics: any[] = [];
      if (location) {
        suggestedClinics = await findNearbyClinicsByType(location, aiAnalysis.careType, aiAnalysis.recommendedSpecialty);
      }

      // Calculate cost estimates
      const costEstimate = calculateCostEstimate(aiAnalysis.careType, req.user?.insurance);

      // Create triage session
      const triageSession = await TriageSession.create({
        user: req.user?._id,
        sessionId,
        symptoms,
        symptomDescription,
        additionalNotes,
        photos,
        duration,
        severity,
        location,
        patientInfo: {
          age: symptomData.age,
          gender: symptomData.gender,
          medicalHistory: symptomData.medicalHistory,
          currentMedications: symptomData.currentMedications,
          allergies: symptomData.allergies
        },
        aiAnalysis,
        recommendations: {
          careType: aiAnalysis.careType,
          suggestedClinics: suggestedClinics.map(c => c._id),
          timeframe: aiAnalysis.timeframe,
          estimatedWaitTime: calculateWaitTime(aiAnalysis.urgency),
          costEstimate
        },
        followUpQuestions,
        disclaimers: aiAnalysis.disclaimers,
        confidence: aiAnalysis.confidence,
        processingTime,
        isCompleted: true
      });

      // Cache the session for quick access
      await setCache(`triage_session_${sessionId}`, triageSession, 3600); // 1 hour

      // Prepare photo URLs for response
      const photoUrls = photos.map(photo => ({
        ...photo,
        url: getFileUrl(photo.filename)
      }));

      res.status(201).json({
        success: true,
        sessionId,
        triageResult: {
          urgency: aiAnalysis.urgency,
          urgencyScore: aiAnalysis.urgencyScore,
          possibleConditions: aiAnalysis.possibleConditions,
          recommendedAction: aiAnalysis.recommendedAction,
          recommendedSpecialty: aiAnalysis.recommendedSpecialty,
          redFlags: aiAnalysis.redFlags,
          selfCareAdvice: aiAnalysis.selfCareAdvice,
          whenToSeekHelp: aiAnalysis.whenToSeekHelp,
          confidence: aiAnalysis.confidence,
          careType: aiAnalysis.careType,
          timeframe: aiAnalysis.timeframe,
          disclaimers: aiAnalysis.disclaimers,
          imageAnalysis: aiAnalysis.imageAnalysis
        },
        recommendations: {
          suggestedClinics,
          estimatedWaitTime: calculateWaitTime(aiAnalysis.urgency),
          costEstimate
        },
        followUpQuestions,
        photos: photoUrls,
        processingTime
      });
    } catch (aiError) {
      // If AI analysis fails, clean up uploaded files and return error
      if (uploadedFiles.length > 0) {
        deleteUploadedFiles(uploadedFiles.map(f => f.filename));
      }
      throw aiError;
    }
  } catch (error) {
    // Clean up uploaded files on any error
    if (req.files) {
      const files = req.files as Express.Multer.File[];
      deleteUploadedFiles(files.map(f => f.filename));
    }
    next(error);
  }
};

// @desc    Get triage session results
// @route   GET /api/triage/session/:sessionId
// @access  Public
export const getTriageSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;

    // Try to get from cache first
    let triageSession = await getCache(`triage_session_${sessionId}`);

    if (!triageSession) {
      // Get from database
      triageSession = await TriageSession.findOne({ sessionId })
        .populate('recommendations.suggestedClinics')
        .populate('user', 'name email');

      if (!triageSession) {
        return res.status(404).json({
          success: false,
          error: 'Triage session not found'
        });
      }

      // Cache for future requests
      await setCache(`triage_session_${sessionId}`, triageSession, 3600);
    }

    // Add photo URLs to response
    if (triageSession.photos) {
      triageSession.photos = triageSession.photos.map((photo: any) => ({
        ...photo,
        url: getFileUrl(photo.filename)
      }));
    }

    res.status(200).json({
      success: true,
      triageSession
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit feedback for triage session
// @route   POST /api/triage/session/:sessionId/feedback
// @access  Public
export const submitTriageFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const { helpful, accuracy, comments } = req.body;

    const triageSession = await TriageSession.findOne({ sessionId });

    if (!triageSession) {
      return res.status(404).json({
        success: false,
        error: 'Triage session not found'
      });
    }

    triageSession.userFeedback = {
      helpful,
      accuracy,
      comments
    };

    await triageSession.save();

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's triage history
// @route   GET /api/triage/history
// @access  Private
export const getTriageHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const triageSessions = await TriageSession.find({ user: req.user?._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('recommendations.suggestedClinics', 'name address type');

    // Add photo URLs to each session
    const sessionsWithPhotoUrls = triageSessions.map(session => {
      const sessionObj = session.toObject();
      if (sessionObj.photos) {
        sessionObj.photos = sessionObj.photos.map((photo: any) => ({
          ...photo,
          url: getFileUrl(photo.filename)
        }));
      }
      return sessionObj;
    });

    const total = await TriageSession.countDocuments({ user: req.user?._id });

    res.status(200).json({
      success: true,
      triageSessions: sessionsWithPhotoUrls,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete triage session and associated photos
// @route   DELETE /api/triage/session/:sessionId
// @access  Private
export const deleteTriageSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;

    const triageSession = await TriageSession.findOne({ sessionId });

    if (!triageSession) {
      return res.status(404).json({
        success: false,
        error: 'Triage session not found'
      });
    }

    // Check if user owns this session
    if (req.user && triageSession.user && triageSession.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this session'
      });
    }

    // Delete associated photos
    if (triageSession.photos && triageSession.photos.length > 0) {
      const filenames = triageSession.photos.map(photo => photo.filename);
      deleteUploadedFiles(filenames);
    }

    // Delete session from database
    await TriageSession.findByIdAndDelete(triageSession._id);

    // Remove from cache
    await setCache(`triage_session_${sessionId}`, null, 1);

    res.status(200).json({
      success: true,
      message: 'Triage session deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions (keeping existing ones and adding new photo-related logic)
const findNearbyClinicsByType = async (location: any, careType: string, specialties: string[]) => {
  try {
    const searchRadius = 50000; // 50km
    
    // Build query based on care type
    let query: any = {
      isActive: true,
      isVerified: true,
      'location.lat': {
        $gte: location.lat - 0.45, // Roughly 50km
        $lte: location.lat + 0.45
      },
      'location.lng': {
        $gte: location.lng - 0.45,
        $lte: location.lng + 0.45
      }
    };

    // Filter by type based on care type
    switch (careType) {
      case 'emergency':
        query.emergencyServices = true;
        break;
      case 'urgent_care':
        query.$or = [
          { type: 'urgent_care' },
          { emergencyServices: true }
        ];
        break;
      case 'specialist':
        if (specialties.length > 0) {
          query.specialties = { $in: specialties };
        }
        break;
      case 'primary_care':
        query.type = { $in: ['clinic', 'hospital'] };
        break;
    }

    const clinics = await Clinic.find(query)
      .limit(10)
      .sort({ rating: -1 });

    // Calculate distances and add to results
    return clinics.map(clinic => {
      const distance = mapsService.calculateDistance(
        location.lat,
        location.lng,
        clinic.location.lat,
        clinic.location.lng
      );

      return {
        ...clinic.toObject(),
        distance: Math.round(distance * 10) / 10 // Round to 1 decimal place
      };
    }).sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Error finding nearby clinics:', error);
    return [];
  }
};

const calculateCostEstimate = (careType: string, insurance?: any) => {
  const baseCosts = {
    emergency: { min: 1000, max: 5000 },
    urgent_care: { min: 200, max: 800 },
    primary_care: { min: 150, max: 400 },
    specialist: { min: 300, max: 800 },
    telemedicine: { min: 50, max: 200 },
    self_care: { min: 0, max: 50 }
  };

  const cost = baseCosts[careType as keyof typeof baseCosts] || baseCosts.primary_care;
  
  // Apply insurance coverage if available
  if (insurance?.provider) {
    const coveragePercentage = 0.8; // Default 80% coverage
    cost.min = Math.round(cost.min * (1 - coveragePercentage));
    cost.max = Math.round(cost.max * (1 - coveragePercentage));
  }

  return {
    ...cost,
    currency: 'USD'
  };
};

const calculateWaitTime = (urgency: string): number => {
  switch (urgency) {
    case 'emergency':
      return 15; // 15 minutes
    case 'urgent':
      return 45; // 45 minutes
    case 'routine':
      return 120; // 2 hours
    default:
      return 60; // 1 hour
  }
};