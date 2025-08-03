"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.sendTokenResponse = exports.generateRefreshToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};
exports.generateToken = generateToken;
const generateRefreshToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
    });
};
exports.generateRefreshToken = generateRefreshToken;
const sendTokenResponse = (user, statusCode, res) => {
    const token = (0, exports.generateToken)(user._id);
    const refreshToken = (0, exports.generateRefreshToken)(user._id);
    const options = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };
    res
        .status(statusCode)
        .cookie('token', token, options)
        .cookie('refreshToken', refreshToken, { ...options, expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })
        .json({
        success: true,
        token,
        refreshToken,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            location: user.location,
            insurance: user.insurance,
            medicalHistory: user.medicalHistory,
            preferences: user.preferences,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    });
};
exports.sendTokenResponse = sendTokenResponse;
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_REFRESH_SECRET);
    }
    catch (error) {
        throw new Error('Invalid refresh token');
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
//# sourceMappingURL=jwt.js.map