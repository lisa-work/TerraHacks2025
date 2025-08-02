import express from 'express';
import { body } from 'express-validator';
import {
  startTriageSession,
  getTriageSession,
  submitTriageFeedback,
  getTriageHistory,
  deleteTriageSession
} from '../controllers/triageController';
import { optionalAuth, protect } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { uploadMultiple, serveUploadedFile } from '../middleware/upload';

const router = express.Router();

// Validation rules
const startTriageValidation = [
  body('symptoms')
    .isArray({ min: 1 })
    .withMessage('At least one symptom is required'),
  body('symptoms.*')
    .trim()
    .notEmpty()
    .withMessage('Symptom cannot be empty'),
  body('symptomDescription')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Symptom description must be between 10 and 2000 characters'),
  body('additionalNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Additional notes cannot exceed 1000 characters'),
  body('duration')
    .trim()
    .notEmpty()
    .withMessage('Duration is required'),
  body('severity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Severity must be between 1 and 10'),
  body('location.lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('location.lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('patientInfo.age')
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be between 0 and 150'),
  body('patientInfo.gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender value')
];

const feedbackValidation = [
  body('helpful')
    .isBoolean()
    .withMessage('Helpful must be a boolean value'),
  body('accuracy')
    .isInt({ min: 1, max: 5 })
    .withMessage('Accuracy must be between 1 and 5'),
  body('comments')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comments cannot exceed 500 characters')
];

// Custom middleware to handle photo upload errors
const handleUploadError = (err: any, req: any, res: any, next: any) => {
  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message || 'File upload error'
    });
  }
  next();
};

// Routes
router.post('/start', 
  optionalAuth, 
  uploadMultiple, 
  handleUploadError,
  startTriageValidation, 
  validateRequest, 
  startTriageSession
);

router.get('/session/:sessionId', getTriageSession);
router.post('/session/:sessionId/feedback', feedbackValidation, validateRequest, submitTriageFeedback);
router.delete('/session/:sessionId', protect, deleteTriageSession);
router.get('/history', protect, getTriageHistory);

// Route to serve uploaded photos
router.get('/photos/:filename', serveUploadedFile);

export default router;