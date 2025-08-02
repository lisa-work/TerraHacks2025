import express from 'express';
import { body } from 'express-validator';
import {
  updateProfile,
  getProfile,
  deleteAccount
} from '../controllers/userController';
import { protect } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Invalid gender value'),
  body('location.lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('location.lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('location.address')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Address cannot be empty')
];

// All routes require authentication
router.use(protect);

// Routes
router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, validateRequest, updateProfile);
router.delete('/profile', deleteAccount);

export default router;