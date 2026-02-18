import { Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import UploadedImage from '../models/UploadedImage';
import { AuthRequest } from '../middleware/auth';
import { analyzeImageWithGemini } from '../services/aiService';

// @desc    Upload image
// @route   POST /api/upload/image
// @access  Private
export const uploadImage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file uploaded'
      });
    }

    const { description, symptoms, triageSessionId, appointmentId } = req.body;

    const uploadedImage = await UploadedImage.create({
      userId: req.user!.id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      description,
      relatedSymptoms: symptoms ? symptoms.split(',').map((s: string) => s.trim()) : [],
      triageSessionId: triageSessionId || undefined,
      appointmentId: appointmentId || undefined
    });

    // Automatically analyze the image if it's related to symptoms
    if (symptoms || description) {
      try {
        await analyzeImageWithAI(uploadedImage._id.toString(), req, res, next, false);
      } catch (error) {
        console.error('Auto-analysis failed:', error);
        // Continue without failing the upload
      }
    }

    res.status(201).json({
      success: true,
      data: uploadedImage
    });
  } catch (error) {
    // Clean up uploaded file if database save fails
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to clean up uploaded file:', unlinkError);
      }
    }
    next(error);
  }
};

// @desc    Get user's uploaded images
// @route   GET /api/upload/images
// @access  Private
export const getUserImages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { page = 1, limit = 20, triageSessionId, appointmentId } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const filter: any = { 
      userId: req.user!.id,
      isDeleted: false
    };

    if (triageSessionId) {
      filter.triageSessionId = triageSessionId;
    }

    if (appointmentId) {
      filter.appointmentId = appointmentId;
    }

    const images = await UploadedImage.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('triageSessionId', 'symptoms urgencyLevel')
      .populate('appointmentId', 'type scheduledFor');

    const total = await UploadedImage.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: images.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: images
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete uploaded image
// @route   DELETE /api/upload/image/:id
// @access  Private
export const deleteImage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const image = await UploadedImage.findOne({
      _id: req.params.id,
      userId: req.user!.id
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }

    // Mark as deleted instead of actually deleting
    image.isDeleted = true;
    await image.save();

    // Optionally delete the physical file
    try {
      if (fs.existsSync(image.filePath)) {
        fs.unlinkSync(image.filePath);
      }
    } catch (fileError) {
      console.error('Failed to delete physical file:', fileError);
    }

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze image with AI
// @route   POST /api/upload/analyze/:id
// @access  Private
export const analyzeImageWithAI = async (
  idOrReq: string | AuthRequest, 
  resOrRes?: Response, 
  nextOrNext?: NextFunction,
  returnResponse: boolean = true
): Promise<any> => {
  try {
    let imageId: string;
    let req: AuthRequest;
    let res: Response;
    let next: NextFunction;

    if (typeof idOrReq === 'string') {
      imageId = idOrReq;
      req = resOrRes as AuthRequest;
      res = nextOrNext as Response;
      next = arguments[3] as NextFunction;
    } else {
      req = idOrReq;
      res = resOrRes as Response;
      next = nextOrNext as NextFunction;
      imageId = req.params.id;
    }

    const image = await UploadedImage.findOne({
      _id: imageId,
      userId: req.user!.id,
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

    // Check if image exists on disk
    if (!fs.existsSync(image.filePath)) {
      if (returnResponse) {
        return res.status(404).json({
          success: false,
          error: 'Image file not found on server'
        });
      }
      throw new Error('Image file not found on server');
    }

    // Analyze with AI
    const analysis = await analyzeImageWithGemini(
      image.filePath,
      image.description || '',
      image.relatedSymptoms
    );

    // Update image with analysis results
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
  } catch (error) {
    if (returnResponse && next) {
      next(error);
    } else {
      throw error;
    }
  }
};

// @desc    Get image analysis
// @route   GET /api/upload/analysis/:id
// @access  Private
export const getImageAnalysis = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const image = await UploadedImage.findOne({
      _id: req.params.id,
      userId: req.user!.id,
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
  } catch (error) {
    next(error);
  }
};