"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.getProfile = exports.updateProfile = void 0;
const User_1 = __importDefault(require("../models/User"));
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone, dateOfBirth, gender, location, insurance, preferences } = req.body;
        const user = await User_1.default.findById(req.user?._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        if (name)
            user.name = name;
        if (phone)
            user.phone = phone;
        if (dateOfBirth)
            user.dateOfBirth = new Date(dateOfBirth);
        if (gender)
            user.gender = gender;
        if (location)
            user.location = location;
        if (insurance)
            user.insurance = { ...user.insurance, ...insurance };
        if (preferences)
            user.preferences = { ...user.preferences, ...preferences };
        await user.save();
        res.status(200).json({
            success: true,
            user
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
const getProfile = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user?._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            user
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
const deleteAccount = async (req, res, next) => {
    try {
        const user = await User_1.default.findById(req.user?._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        await User_1.default.findByIdAndDelete(req.user?._id);
        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAccount = deleteAccount;
//# sourceMappingURL=userController.js.map