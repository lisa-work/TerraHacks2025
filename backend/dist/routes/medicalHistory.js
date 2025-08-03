"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const medicalHistoryController_1 = require("../controllers/medicalHistoryController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
const updateMedicalHistoryValidation = [
    (0, express_validator_1.body)('allergies')
        .optional()
        .isArray()
        .withMessage('Allergies must be an array'),
    (0, express_validator_1.body)('allergies.*')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Allergy cannot be empty'),
    (0, express_validator_1.body)('bloodType')
        .optional()
        .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
        .withMessage('Invalid blood type'),
    (0, express_validator_1.body)('height')
        .optional()
        .isFloat({ min: 50, max: 300 })
        .withMessage('Height must be between 50 and 300 cm'),
    (0, express_validator_1.body)('weight')
        .optional()
        .isFloat({ min: 1, max: 1000 })
        .withMessage('Weight must be between 1 and 1000 kg'),
    (0, express_validator_1.body)('emergencyContact.name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Emergency contact name is required'),
    (0, express_validator_1.body)('emergencyContact.phone')
        .optional()
        .isMobilePhone('any')
        .withMessage('Valid emergency contact phone is required'),
    (0, express_validator_1.body)('emergencyContact.relationship')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Emergency contact relationship is required')
];
const addAllergyValidation = [
    (0, express_validator_1.body)('allergy')
        .trim()
        .notEmpty()
        .withMessage('Allergy is required')
];
const addMedicationValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .notEmpty()
        .withMessage('Medication name is required'),
    (0, express_validator_1.body)('dosage')
        .trim()
        .notEmpty()
        .withMessage('Dosage is required'),
    (0, express_validator_1.body)('frequency')
        .trim()
        .notEmpty()
        .withMessage('Frequency is required'),
    (0, express_validator_1.body)('startDate')
        .isISO8601()
        .withMessage('Valid start date is required'),
    (0, express_validator_1.body)('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid date'),
    (0, express_validator_1.body)('prescribedBy')
        .trim()
        .notEmpty()
        .withMessage('Prescribed by is required')
];
const updateMedicationValidation = [
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Medication name cannot be empty'),
    (0, express_validator_1.body)('dosage')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Dosage cannot be empty'),
    (0, express_validator_1.body)('frequency')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Frequency cannot be empty'),
    (0, express_validator_1.body)('startDate')
        .optional()
        .isISO8601()
        .withMessage('Start date must be valid'),
    (0, express_validator_1.body)('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be valid'),
    (0, express_validator_1.body)('prescribedBy')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Prescribed by cannot be empty')
];
const addConditionValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .notEmpty()
        .withMessage('Condition name is required'),
    (0, express_validator_1.body)('diagnosedDate')
        .isISO8601()
        .withMessage('Valid diagnosed date is required'),
    (0, express_validator_1.body)('status')
        .isIn(['active', 'resolved', 'chronic'])
        .withMessage('Status must be active, resolved, or chronic'),
    (0, express_validator_1.body)('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Notes cannot exceed 500 characters')
];
const updateConditionValidation = [
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Condition name cannot be empty'),
    (0, express_validator_1.body)('diagnosedDate')
        .optional()
        .isISO8601()
        .withMessage('Diagnosed date must be valid'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['active', 'resolved', 'chronic'])
        .withMessage('Status must be active, resolved, or chronic'),
    (0, express_validator_1.body)('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Notes cannot exceed 500 characters')
];
router.use(auth_1.protect);
router.get('/', medicalHistoryController_1.getMedicalHistory);
router.put('/', updateMedicalHistoryValidation, validation_1.validateRequest, medicalHistoryController_1.updateMedicalHistory);
router.post('/allergies', addAllergyValidation, validation_1.validateRequest, medicalHistoryController_1.addAllergy);
router.delete('/allergies/:allergy', medicalHistoryController_1.removeAllergy);
router.post('/medications', addMedicationValidation, validation_1.validateRequest, medicalHistoryController_1.addMedication);
router.put('/medications/:id', updateMedicationValidation, validation_1.validateRequest, medicalHistoryController_1.updateMedication);
router.delete('/medications/:id', medicalHistoryController_1.removeMedication);
router.post('/conditions', addConditionValidation, validation_1.validateRequest, medicalHistoryController_1.addCondition);
router.put('/conditions/:id', updateConditionValidation, validation_1.validateRequest, medicalHistoryController_1.updateCondition);
router.delete('/conditions/:id', medicalHistoryController_1.removeCondition);
exports.default = router;
//# sourceMappingURL=medicalHistory.js.map