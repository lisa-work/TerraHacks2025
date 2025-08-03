"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTriageHistory = exports.submitTriageFeedback = exports.getTriageSession = exports.startTriageSession = void 0;
const uuid_1 = require("uuid");
const TriageSession_1 = __importDefault(require("../models/TriageSession"));
const User_1 = __importDefault(require("../models/User"));
const Clinic_1 = __importDefault(require("../models/Clinic"));
const geminiService_1 = __importDefault(require("../services/geminiService"));
const mapsService_1 = __importDefault(require("../services/mapsService"));
const redis_1 = require("../config/redis");
const startTriageSession = async (req, res, next) => {
    try {
        const { symptoms, symptomDescription, duration, severity, location, patientInfo } = req.body;
        const sessionId = (0, uuid_1.v4)();
        const startTime = Date.now();
        let medicalHistory = [];
        let currentMedications = [];
        let allergies = [];
        if (req.user) {
            const user = await User_1.default.findById(req.user._id);
            if (user) {
                medicalHistory = user.medicalHistory.conditions.map(c => c.name);
                currentMedications = user.medicalHistory.medications.map(m => m.name);
                allergies = user.medicalHistory.allergies;
            }
        }
        const symptomData = {
            symptoms,
            symptomDescription,
            duration,
            severity,
            age: patientInfo?.age || (req.user?.dateOfBirth ?
                new Date().getFullYear() - new Date(req.user.dateOfBirth).getFullYear() : undefined),
            gender: patientInfo?.gender || req.user?.gender,
            medicalHistory: [...medicalHistory, ...(patientInfo?.medicalHistory || [])],
            currentMedications: [...currentMedications, ...(patientInfo?.currentMedications || [])],
            allergies: [...allergies, ...(patientInfo?.allergies || [])]
        };
        const aiAnalysis = await geminiService_1.default.analyzeSymptoms(symptomData);
        const processingTime = Date.now() - startTime;
        const followUpQuestions = await geminiService_1.default.generateFollowUpQuestions(symptomData, aiAnalysis);
        let suggestedClinics = [];
        if (location) {
            suggestedClinics = await findNearbyClinicsByType(location, aiAnalysis.careType, aiAnalysis.recommendedSpecialty);
        }
        const costEstimate = calculateCostEstimate(aiAnalysis.careType, req.user?.insurance);
        const triageSession = await TriageSession_1.default.create({
            user: req.user?._id,
            sessionId,
            symptoms,
            symptomDescription,
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
        await (0, redis_1.setCache)(`triage_session_${sessionId}`, triageSession, 3600);
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
                disclaimers: aiAnalysis.disclaimers
            },
            recommendations: {
                suggestedClinics,
                estimatedWaitTime: calculateWaitTime(aiAnalysis.urgency),
                costEstimate
            },
            followUpQuestions,
            processingTime
        });
    }
    catch (error) {
        next(error);
    }
};
exports.startTriageSession = startTriageSession;
const getTriageSession = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        let triageSession = await (0, redis_1.getCache)(`triage_session_${sessionId}`);
        if (!triageSession) {
            triageSession = await TriageSession_1.default.findOne({ sessionId })
                .populate('recommendations.suggestedClinics')
                .populate('user', 'name email');
            if (!triageSession) {
                return res.status(404).json({
                    success: false,
                    error: 'Triage session not found'
                });
            }
            await (0, redis_1.setCache)(`triage_session_${sessionId}`, triageSession, 3600);
        }
        res.status(200).json({
            success: true,
            triageSession
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTriageSession = getTriageSession;
const submitTriageFeedback = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const { helpful, accuracy, comments } = req.body;
        const triageSession = await TriageSession_1.default.findOne({ sessionId });
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
    }
    catch (error) {
        next(error);
    }
};
exports.submitTriageFeedback = submitTriageFeedback;
const getTriageHistory = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const triageSessions = await TriageSession_1.default.find({ user: req.user?._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('recommendations.suggestedClinics', 'name address type');
        const total = await TriageSession_1.default.countDocuments({ user: req.user?._id });
        res.status(200).json({
            success: true,
            triageSessions,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTriageHistory = getTriageHistory;
const findNearbyClinicsByType = async (location, careType, specialties) => {
    try {
        const searchRadius = 50000;
        let query = {
            isActive: true,
            isVerified: true,
            'location.lat': {
                $gte: location.lat - 0.45,
                $lte: location.lat + 0.45
            },
            'location.lng': {
                $gte: location.lng - 0.45,
                $lte: location.lng + 0.45
            }
        };
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
        const clinics = await Clinic_1.default.find(query)
            .limit(10)
            .sort({ rating: -1 });
        return clinics.map(clinic => {
            const distance = mapsService_1.default.calculateDistance(location.lat, location.lng, clinic.location.lat, clinic.location.lng);
            return {
                ...clinic.toObject(),
                distance: Math.round(distance * 10) / 10
            };
        }).sort((a, b) => a.distance - b.distance);
    }
    catch (error) {
        console.error('Error finding nearby clinics:', error);
        return [];
    }
};
const calculateCostEstimate = (careType, insurance) => {
    const baseCosts = {
        emergency: { min: 1000, max: 5000 },
        urgent_care: { min: 200, max: 800 },
        primary_care: { min: 150, max: 400 },
        specialist: { min: 300, max: 800 },
        telemedicine: { min: 50, max: 200 },
        self_care: { min: 0, max: 50 }
    };
    const cost = baseCosts[careType] || baseCosts.primary_care;
    if (insurance?.provider) {
        const coveragePercentage = 0.8;
        cost.min = Math.round(cost.min * (1 - coveragePercentage));
        cost.max = Math.round(cost.max * (1 - coveragePercentage));
    }
    return {
        ...cost,
        currency: 'USD'
    };
};
const calculateWaitTime = (urgency) => {
    switch (urgency) {
        case 'emergency':
            return 15;
        case 'urgent':
            return 45;
        case 'routine':
            return 120;
        default:
            return 60;
    }
};
//# sourceMappingURL=triageController.js.map