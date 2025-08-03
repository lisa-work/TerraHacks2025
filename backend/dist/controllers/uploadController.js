"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageAnalysis = exports.analyzeImageWithAI = exports.deleteImage = exports.getUserImages = exports.uploadImage = void 0;
const fs_1 = __importDefault(require("fs"));
const UploadedImage_1 = __importDefault(require("../models/UploadedImage"));
const aiService_1 = require("../services/aiService");
const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file uploaded'
            });
        }
        const { description, symptoms, triageSessionId, appointmentId } = req.body;
        const uploadedImage = await UploadedImage_1.default.create({
            userId: req.user.id,
            fileName: req.file.filename,
            originalName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            description,
            relatedSymptoms: symptoms ? symptoms.split(',').map((s) => s.trim()) : [],
            triageSessionId: triageSessionId || undefined,
            appointmentId: appointmentId || undefined
        });
        if (symptoms || description) {
            try {
                await (0, exports.analyzeImageWithAI)(uploadedImage._id.toString(), req, res, next, false);
            }
            catch (error) {
                console.error('Auto-analysis failed:', error);
            }
        }
        res.status(201).json({
            success: true,
            data: uploadedImage
        });
    }
    catch (error) {
        if (req.file) {
            try {
                fs_1.default.unlinkSync(req.file.path);
            }
            catch (unlinkError) {
                console.error('Failed to clean up uploaded file:', unlinkError);
            }
        }
        next(error);
    }
};
exports.uploadImage = uploadImage;
const getUserImages = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, triageSessionId, appointmentId } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const filter = {
            userId: req.user.id,
            isDeleted: false
        };
        if (triageSessionId) {
            filter.triageSessionId = triageSessionId;
        }
        if (appointmentId) {
            filter.appointmentId = appointmentId;
        }
        const images = await UploadedImage_1.default.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .populate('triageSessionId', 'symptoms urgencyLevel')
            .populate('appointmentId', 'type scheduledFor');
        const total = await UploadedImage_1.default.countDocuments(filter);
        res.status(200).json({
            success: true,
            count: images.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            data: images
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserImages = getUserImages;
const deleteImage = async (req, res, next) => {
    try {
        const image = await UploadedImage_1.default.findOne({
            _id: req.params.id,
            userId: req.user.id
        });
        if (!image) {
            return res.status(404).json({
                success: false,
                error: 'Image not found'
            });
        }
        image.isDeleted = true;
        await image.save();
        try {
            if (fs_1.default.existsSync(image.filePath)) {
                fs_1.default.unlinkSync(image.filePath);
            }
        }
        catch (fileError) {
            console.error('Failed to delete physical file:', fileError);
        }
        res.status(200).json({
            success: true,
            message: 'Image deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteImage = deleteImage;
const analyzeImageWithAI = async (idOrReq, resOrRes, nextOrNext, returnResponse = true) => {
    try {
        let imageId;
        let req;
        let res;
        let next;
        if (typeof idOrReq === 'string') {
            imageId = idOrReq;
            req = resOrRes;
            res = nextOrNext;
            next = arguments[3];
        }
        else {
            req = idOrReq;
            res = resOrRes;
            next = nextOrNext;
            imageId = req.params.id;
        }
        const image = await UploadedImage_1.default.findOne({
            _id: imageId,
            userId: req.user.id,
            isDeleted: false
        });
        if (!image) {
            if (returnResponse) {
                return res.status(404).json({
                    success: false,
                    error: 'Image not found'
                });
            }
            throw new Error('Image not found');
        }
        if (!fs_1.default.existsSync(image.filePath)) {
            if (returnResponse) {
                return res.status(404).json({
                    success: false,
                    error: 'Image file not found on server'
                });
            }
            throw new Error('Image file not found on server');
        }
        const analysis = await (0, aiService_1.analyzeImageWithGemini)(image.filePath, image.description || '', image.relatedSymptoms);
        image.aiAnalysis = {
            analyzed: true,
            confidence: analysis.confidence,
            findings: analysis.findings,
            urgencyLevel: analysis.urgencyLevel,
            recommendations: analysis.recommendations,
            medicalTerms: analysis.medicalTerms,
            bodyParts: analysis.bodyParts,
            analysisDate: new Date(),
            model: analysis.model
        };
        await image.save();
        if (returnResponse) {
            res.status(200).json({
                success: true,
                data: {
                    image,
                    analysis: image.aiAnalysis
                }
            });
        }
        return image.aiAnalysis;
    }
    catch (error) {
        if (returnResponse && next) {
            next(error);
        }
        else {
            throw error;
        }
    }
};
exports.analyzeImageWithAI = analyzeImageWithAI;
const getImageAnalysis = async (req, res, next) => {
    try {
        const image = await UploadedImage_1.default.findOne({
            _id: req.params.id,
            userId: req.user.id,
            isDeleted: false
        });
        if (!image) {
            return res.status(404).json({
                success: false,
                error: 'Image not found'
            });
        }
        if (!image.aiAnalysis?.analyzed) {
            return res.status(404).json({
                success: false,
                error: 'Image has not been analyzed yet'
            });
        }
        res.status(200).json({
            success: true,
            data: image.aiAnalysis
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getImageAnalysis = getImageAnalysis;
//# sourceMappingURL=uploadController.js.map