import express from 'express';
import { body } from 'express-validator';
import {
  getMedicalHistory,
  updateMedicalHistory,
  addAllergy,
  removeAllergy,
  addMedication,
  updateMedication,
  removeMedication,
  addCondition,
  updateCondition,
  removeCondition
} from '../controllers/medicalHistoryController';
import { protect } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

// Validation rules
const updateMedicalHistoryValidation = [
  body('allergies')
    .optional()
    .isArray()
    .withMessage('Allergies must be an array'),
  body('allergies.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Allergy cannot be empty'),
  body('bloodType')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood type'),
  body('height')
    .optional()
    .isFloat({ min: 50, max: 300 })
    .withMessage('Height must be between 50 and 300 cm'),
  body('weight')
    .optional()
    .isFloat({ min: 1, max: 1000 })
    .withMessage('Weight must be between 1 and 1000 kg'),
  body('emergencyContact.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Emergency contact name is required'),
  body('emergencyContact.phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Valid emergency contact phone is required'),
  body('emergencyContact.relationship')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Emergency contact relationship is required')
];

const addAllergyValidation = [
  body('allergy')
    .trim()
    .notEmpty()
    .withMessage('Allergy is required')
];

const addMedicationValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Medication name is required'),
  body('dosage')
    .trim()
    .notEmpty()
    .withMessage('Dosage is required'),
  body('frequency')
    .trim()
    .notEmpty()
    .withMessage('Frequency is required'),
  body('startDate')
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('prescribedBy')
    .trim()
    .notEmpty()
    .withMessage('Prescribed by is required')
];

const updateMedicationValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Medication name cannot be empty'),
  body('dosage')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Dosage cannot be empty'),
  body('frequency')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Frequency cannot be empty'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be valid'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be valid'),
  body('prescribedBy')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Prescribed by cannot be empty')
];

const addConditionValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Condition name is required'),
  body('diagnosedDate')
    .isISO8601()
    .withMessage('Valid diagnosed date is required'),
  body('status')
    .isIn(['active', 'resolved', 'chronic'])
    .withMessage('Status must be active, resolved, or chronic'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const updateConditionValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Condition name cannot be empty'),
  body('diagnosedDate')
    .optional()
    .isISO8601()
    .withMessage('Diagnosed date must be valid'),
  body('status')
    .optional()
    .isIn(['active', 'resolved', 'chronic'])
    .withMessage('Status must be active, resolved, or chronic'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// All routes require authentication
router.use(protect);

// Main medical history routes
router.get('/', getMedicalHistory);
router.put('/', updateMedicalHistoryValidation, validateRequest, updateMedicalHistory);

// Allergy routes
router.post('/allergies', addAllergyValidation, validateRequest, addAllergy);
router.delete('/allergies/:allergy', removeAllergy);

// Medication routes
router.post('/medications', addMedicationValidation, validateRequest, addMedication);
router.put('/medications/:id', updateMedicationValidation, validateRequest, updateMedication);
router.delete('/medications/:id', removeMedication);

// Condition routes
router.post('/conditions', addConditionValidation, validateRequest, addCondition);
router.put('/conditions/:id', updateConditionValidation, validateRequest, updateCondition);
router.delete('/conditions/:id', removeCondition);

export default router;