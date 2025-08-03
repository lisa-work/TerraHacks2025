"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const triageController_1 = require("../controllers/triageController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
const startTriageValidation = [
    (0, express_validator_1.body)('symptoms')
        .isArray({ min: 1 })
        .withMessage('At least one symptom is required'),
    (0, express_validator_1.body)('symptoms.*')
        .trim()
        .notEmpty()
        .withMessage('Symptom cannot be empty'),
    (0, express_validator_1.body)('symptomDescription')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Symptom description must be between 10 and 2000 characters'),
    (0, express_validator_1.body)('duration')
        .trim()
        .notEmpty()
        .withMessage('Duration is required'),
    (0, express_validator_1.body)('severity')
        .isInt({ min: 1, max: 10 })
        .withMessage('Severity must be between 1 and 10'),
    (0, express_validator_1.body)('location.lat')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    (0, express_validator_1.body)('location.lng')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    (0, express_validator_1.body)('patientInfo.age')
        .optional()
        .isInt({ min: 0, max: 150 })
        .withMessage('Age must be between 0 and 150'),
    (0, express_validator_1.body)('patientInfo.gender')
        .optional()
        .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
        .withMessage('Invalid gender value')
];
const feedbackValidation = [
    (0, express_validator_1.body)('helpful')
        .isBoolean()
        .withMessage('Helpful must be a boolean value'),
    (0, express_validator_1.body)('accuracy')
        .isInt({ min: 1, max: 5 })
        .withMessage('Accuracy must be between 1 and 5'),
    (0, express_validator_1.body)('comments')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Comments cannot exceed 500 characters')
];
router.post('/start', auth_1.optionalAuth, startTriageValidation, validation_1.validateRequest, triageController_1.startTriageSession);
router.get('/session/:sessionId', triageController_1.getTriageSession);
router.post('/session/:sessionId/feedback', feedbackValidation, validation_1.validateRequest, triageController_1.submitTriageFeedback);
router.get('/history', auth_1.protect, triageController_1.getTriageHistory);
exports.default = router;
//# sourceMappingURL=triage.js.map