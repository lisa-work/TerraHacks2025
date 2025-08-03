"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.logout = exports.getMe = exports.resetPassword = exports.forgotPassword = exports.resendVerification = exports.verifyEmail = exports.login = exports.register = void 0;
const crypto_1 = __importDefault(require("crypto"));
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
const email_1 = require("../utils/email");
const register = async (req, res, next) => {
    try {
        const { name, email, password, phone, dateOfBirth, gender, location, insurance, medicalHistory, preferences } = req.body;
        if (!password || password.length < 8) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 8 characters long'
            });
        }
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        if (!hasUppercase) {
            return res.status(400).json({
                success: false,
                error: 'Password must contain at least one uppercase letter'
            });
        }
        if (!hasNumber) {
            return res.status(400).json({
                success: false,
                error: 'Password must contain at least one number'
            });
        }
        const existingUser = await User_1.default.findOne({
            $or: [{ email }, { phone }]
        });
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({
                    success: false,
                    error: 'An account with this email already exists'
                });
            }
            else {
                return res.status(400).json({
                    success: false,
                    error: 'An account with this phone number already exists'
                });
            }
        }
        const verificationToken = crypto_1.default.randomBytes(20).toString('hex');
        const user = await User_1.default.create({
            name,
            email,
            password,
            phone,
            dateOfBirth,
            gender,
            location,
            insurance,
            medicalHistory: medicalHistory || {
                allergies: [],
                medications: [],
                conditions: [],
                surgeries: [],
                familyHistory: [],
                emergencyContact: {
                    name: '',
                    relationship: '',
                    phone: ''
                },
                lastUpdated: new Date()
            },
            preferences: preferences || {
                language: 'en',
                notifications: {
                    email: true,
                    sms: true,
                    push: true
                },
                privacySettings: {
                    shareDataForResearch: false,
                    allowMarketingCommunications: false
                }
            },
            verificationToken,
            isVerified: false
        });
        try {
            const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
            await (0, email_1.sendEmail)({
                email: user.email,
                subject: 'MediConnect - Verify Your Email',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1D6FA3;">Welcome to MediConnect!</h2>
            <p>Thank you for registering with MediConnect. Please click the button below to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #1D6FA3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email
              </a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
          </div>
        `
            });
        }
        catch (emailError) {
            console.error('Failed to send verification email:', emailError);
        }
        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email to verify your account.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                isVerified: user.isVerified
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide an email and password'
            });
        }
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        user.lastLogin = new Date();
        await user.save();
        (0, jwt_1.sendTokenResponse)(user, 200, res);
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Verification token is required'
            });
        }
        const user = await User_1.default.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Invalid verification token'
            });
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        (0, jwt_1.sendTokenResponse)(user, 200, res);
    }
    catch (error) {
        next(error);
    }
};
exports.verifyEmail = verifyEmail;
const resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                error: 'User is already verified'
            });
        }
        const verificationToken = crypto_1.default.randomBytes(20).toString('hex');
        user.verificationToken = verificationToken;
        await user.save();
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        await (0, email_1.sendEmail)({
            email: user.email,
            subject: 'MediConnect - Verify Your Email',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1D6FA3;">Verify Your Email</h2>
          <p>Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #1D6FA3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        </div>
      `
        });
        res.status(200).json({
            success: true,
            message: 'Verification email sent'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resendVerification = resendVerification;
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        const resetToken = crypto_1.default.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        await (0, email_1.sendEmail)({
            email: user.email,
            subject: 'MediConnect - Password Reset',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1D6FA3;">Password Reset Request</h2>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #1D6FA3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p style="color: #666; font-size: 14px;">This link will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you did not request this reset, please ignore this email.</p>
        </div>
      `
        });
        res.status(200).json({
            success: true,
            message: 'Password reset email sent'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        const resetPasswordToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const user = await User_1.default.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        (0, jwt_1.sendTokenResponse)(user, 200, res);
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
const getMe = async (req, res, next) => {
    try {
        const user = req.user;
        res.status(200).json({
            success: true,
            user
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
const logout = async (req, res, next) => {
    try {
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });
        res.cookie('refreshToken', 'none', {
            expires: new Date(Date.now() + 10 * 1000),
            httpOnly: true
        });
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Refresh token is required'
            });
        }
        try {
            const decoded = (0, jwt_1.verifyRefreshToken)(token);
            const user = await User_1.default.findById(decoded.id);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid refresh token'
                });
            }
            const newToken = (0, jwt_1.generateToken)(user._id.toString());
            res.status(200).json({
                success: true,
                token: newToken
            });
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                error: 'Invalid refresh token'
            });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.refreshToken = refreshToken;
//# sourceMappingURL=authController.js.map