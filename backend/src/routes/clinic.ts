import express from 'express';
import { query } from 'express-validator';
import {
  searchClinics,
  getClinic,
  getClinicAvailability,
  getNearbyClinicsByLocation,
  getSpecialties,
  getInsuranceProviders
} from '../controllers/clinicController';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// Validation rules
const searchValidation = [
  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('radius')
    .optional()
    .isFloat({ min: 1, max: 200 })
    .withMessage('Radius must be between 1 and 200 km'),
  query('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const nearbyValidation = [
  query('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required'),
  query('lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required'),
  query('radius')
    .optional()
    .isFloat({ min: 1, max: 100 })
    .withMessage('Radius must be between 1 and 100 km'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

const availabilityValidation = [
  query('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be in ISO format'),
  query('duration')
    .optional()
    .isInt({ min: 15, max: 240 })
    .withMessage('Duration must be between 15 and 240 minutes')
];

// Routes
router.get('/search', searchValidation, validateRequest, searchClinics);
router.get('/nearby', nearbyValidation, validateRequest, getNearbyClinicsByLocation);
router.get('/specialties', getSpecialties);
router.get('/insurance-providers', getInsuranceProviders);
router.get('/:id', getClinic);
router.get('/:id/availability', availabilityValidation, validateRequest, getClinicAvailability);

export default router;