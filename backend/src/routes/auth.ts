import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
  refreshToken
} from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('phone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  // Make location fields optional
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
    .withMessage('Address cannot be empty if provided'),
  // Make insurance fields optional
  body('insurance.provider')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Insurance provider cannot be empty if provided'),
  body('insurance.policyNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Policy number cannot be empty if provided'),
  body('insurance.groupNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Group number cannot be empty if provided')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

// Routes
router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/forgot-password', forgotPasswordValidation, validateRequest, forgotPassword);
router.put('/reset-password', resetPasswordValidation, validateRequest, resetPassword);
router.get('/me', protect, getMe);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);

export default router;