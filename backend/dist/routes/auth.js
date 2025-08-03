"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
const registerValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    (0, express_validator_1.body)('phone')
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number'),
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
        .withMessage('Address cannot be empty if provided'),
    (0, express_validator_1.body)('insurance.provider')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Insurance provider cannot be empty if provided'),
    (0, express_validator_1.body)('insurance.policyNumber')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Policy number cannot be empty if provided'),
    (0, express_validator_1.body)('insurance.groupNumber')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Group number cannot be empty if provided')
];
const loginValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
];
const forgotPasswordValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email')
];
const resetPasswordValidation = [
    (0, express_validator_1.body)('token')
        .notEmpty()
        .withMessage('Reset token is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];
router.post('/register', registerValidation, validation_1.validateRequest, authController_1.register);
router.post('/login', loginValidation, validation_1.validateRequest, authController_1.login);
router.post('/verify-email', authController_1.verifyEmail);
router.post('/resend-verification', authController_1.resendVerification);
router.post('/forgot-password', forgotPasswordValidation, validation_1.validateRequest, authController_1.forgotPassword);
router.put('/reset-password', resetPasswordValidation, validation_1.validateRequest, authController_1.resetPassword);
router.get('/me', auth_1.protect, authController_1.getMe);
router.post('/logout', authController_1.logout);
router.post('/refresh-token', authController_1.refreshToken);
exports.default = router;
//# sourceMappingURL=auth.js.map