"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
const updateProfileValidation = [
    (0, express_validator_1.body)('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('phone')
        .optional()
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number'),
    (0, express_validator_1.body)('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('Date of birth must be a valid date'),
    (0, express_validator_1.body)('gender')
        .optional()
        .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
        .withMessage('Invalid gender value'),
    (0, express_validator_1.body)('location.lat')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    (0, express_validator_1.body)('location.lng')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    (0, express_validator_1.body)('location.address')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Address cannot be empty')
];
router.use(auth_1.protect);
router.get('/profile', userController_1.getProfile);
router.put('/profile', updateProfileValidation, validation_1.validateRequest, userController_1.updateProfile);
router.delete('/profile', userController_1.deleteAccount);
exports.default = router;
//# sourceMappingURL=user.js.map