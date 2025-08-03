"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const clinicController_1 = require("../controllers/clinicController");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
const searchValidation = [
    (0, express_validator_1.query)('lat')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    (0, express_validator_1.query)('lng')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    (0, express_validator_1.query)('radius')
        .optional()
        .isFloat({ min: 1, max: 200 })
        .withMessage('Radius must be between 1 and 200 km'),
    (0, express_validator_1.query)('rating')
        .optional()
        .isFloat({ min: 0, max: 5 })
        .withMessage('Rating must be between 0 and 5'),
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
];
const nearbyValidation = [
    (0, express_validator_1.query)('lat')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Valid latitude is required'),
    (0, express_validator_1.query)('lng')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Valid longitude is required'),
    (0, express_validator_1.query)('radius')
        .optional()
        .isFloat({ min: 1, max: 100 })
        .withMessage('Radius must be between 1 and 100 km'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50')
];
const availabilityValidation = [
    (0, express_validator_1.query)('date')
        .optional()
        .isISO8601()
        .withMessage('Date must be in ISO format'),
    (0, express_validator_1.query)('duration')
        .optional()
        .isInt({ min: 15, max: 240 })
        .withMessage('Duration must be between 15 and 240 minutes')
];
router.get('/search', searchValidation, validation_1.validateRequest, clinicController_1.searchClinics);
router.get('/nearby', nearbyValidation, validation_1.validateRequest, clinicController_1.getNearbyClinicsByLocation);
router.get('/specialties', clinicController_1.getSpecialties);
router.get('/insurance-providers', clinicController_1.getInsuranceProviders);
router.get('/:id', clinicController_1.getClinic);
router.get('/:id/availability', availabilityValidation, validation_1.validateRequest, clinicController_1.getClinicAvailability);
exports.default = router;
//# sourceMappingURL=clinic.js.map