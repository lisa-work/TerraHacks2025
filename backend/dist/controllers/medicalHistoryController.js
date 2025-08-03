"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCondition = exports.updateCondition = exports.addCondition = exports.removeMedication = exports.updateMedication = exports.addMedication = exports.removeAllergy = exports.addAllergy = exports.updateMedicalHistory = exports.getMedicalHistory = void 0;
const User_1 = __importDefault(require("../models/User"));
const crypto_js_1 = __importDefault(require("crypto-js"));
const encryptSensitiveData = (data) => {
    if (!process.env.ENCRYPTION_KEY) {
        throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    return crypto_js_1.default.AES.encrypt(data, process.env.ENCRYPTION_KEY).toString();
};
const decryptSensitiveData = (encryptedData) => {
    if (!process.env.ENCRYPTION_KEY) {
        throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    const bytes = crypto_js_1.default.AES.decrypt(encryptedData, process.env.ENCRYPTION_KEY);
    return bytes.toString(crypto_js_1.default.enc.Utf8);
};
const getMedicalHistory = async (req, res, next) => {
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
            medicalHistory: user.medicalHistory
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMedicalHistory = getMedicalHistory;
const updateMedicalHistory = async (req, res, next) => {
    try {
        const { allergies, medications, conditions, surgeries, familyHistory, emergencyContact, bloodType, height, weight } = req.body;
        const user = await User_1.default.findById(req.user?._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        if (allergies !== undefined)
            user.medicalHistory.allergies = allergies;
        if (medications !== undefined)
            user.medicalHistory.medications = medications;
        if (conditions !== undefined)
            user.medicalHistory.conditions = conditions;
        if (surgeries !== undefined)
            user.medicalHistory.surgeries = surgeries;
        if (familyHistory !== undefined)
            user.medicalHistory.familyHistory = familyHistory;
        if (emergencyContact !== undefined)
            user.medicalHistory.emergencyContact = emergencyContact;
        if (bloodType !== undefined)
            user.medicalHistory.bloodType = bloodType;
        if (height !== undefined)
            user.medicalHistory.height = height;
        if (weight !== undefined)
            user.medicalHistory.weight = weight;
        user.medicalHistory.lastUpdated = new Date();
        await user.save();
        res.status(200).json({
            success: true,
            medicalHistory: user.medicalHistory
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateMedicalHistory = updateMedicalHistory;
const addAllergy = async (req, res, next) => {
    try {
        const { allergy } = req.body;
        if (!allergy) {
            return res.status(400).json({
                success: false,
                error: 'Allergy is required'
            });
        }
        const user = await User_1.default.findById(req.user?._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        if (user.medicalHistory.allergies.includes(allergy)) {
            return res.status(400).json({
                success: false,
                error: 'Allergy already exists'
            });
        }
        user.medicalHistory.allergies.push(allergy);
        user.medicalHistory.lastUpdated = new Date();
        await user.save();
        res.status(201).json({
            success: true,
            allergies: user.medicalHistory.allergies
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addAllergy = addAllergy;
const removeAllergy = async (req, res, next) => {
    try {
        const { allergy } = req.params;
        const user = await User_1.default.findById(req.user?._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        user.medicalHistory.allergies = user.medicalHistory.allergies.filter(a => a !== allergy);
        user.medicalHistory.lastUpdated = new Date();
        await user.save();
        res.status(200).json({
            success: true,
            allergies: user.medicalHistory.allergies
        });
    }
    catch (error) {
        next(error);
    }
};
exports.removeAllergy = removeAllergy;
const addMedication = async (req, res, next) => {
    try {
        const { name, dosage, frequency, startDate, endDate, prescribedBy } = req.body;
        if (!name || !dosage || !frequency || !startDate || !prescribedBy) {
            return res.status(400).json({
                success: false,
                error: 'Name, dosage, frequency, start date, and prescribed by are required'
            });
        }
        const user = await User_1.default.findById(req.user?._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        const medication = {
            name,
            dosage,
            frequency,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : undefined,
            prescribedBy
        };
        user.medicalHistory.medications.push(medication);
        user.medicalHistory.lastUpdated = new Date();
        await user.save();
        res.status(201).json({
            success: true,
            medications: user.medicalHistory.medications
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addMedication = addMedication;
const updateMedication = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, dosage, frequency, startDate, endDate, prescribedBy } = req.body;
        const user = await User_1.default.findById(req.user?._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        const medicationIndex = user.medicalHistory.medications.findIndex(m => m._id?.toString() === id);
        if (medicationIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Medication not found'
            });
        }
        if (name)
            user.medicalHistory.medications[medicationIndex].name = name;
        if (dosage)
            user.medicalHistory.medications[medicationIndex].dosage = dosage;
        if (frequency)
            user.medicalHistory.medications[medicationIndex].frequency = frequency;
        if (startDate)
            user.medicalHistory.medications[medicationIndex].startDate = new Date(startDate);
        if (endDate)
            user.medicalHistory.medications[medicationIndex].endDate = new Date(endDate);
        if (prescribedBy)
            user.medicalHistory.medications[medicationIndex].prescribedBy = prescribedBy;
        user.medicalHistory.lastUpdated = new Date();
        await user.save();
        res.status(200).json({
            success: true,
            medications: user.medicalHistory.medications
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateMedication = updateMedication;
const removeMedication = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User_1.default.findById(req.user?._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        user.medicalHistory.medications = user.medicalHistory.medications.filter(m => m._id?.toString() !== id);
        user.medicalHistory.lastUpdated = new Date();
        await user.save();
        res.status(200).json({
            success: true,
            medications: user.medicalHistory.medications
        });
    }
    catch (error) {
        next(error);
    }
};
exports.removeMedication = removeMedication;
const addCondition = async (req, res, next) => {
    try {
        const { name, diagnosedDate, status, notes } = req.body;
        if (!name || !diagnosedDate || !status) {
            return res.status(400).json({
                success: false,
                error: 'Name, diagnosed date, and status are required'
            });
        }
        const user = await User_1.default.findById(req.user?._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        const condition = {
            name,
            diagnosedDate: new Date(diagnosedDate),
            status,
            notes
        };
        user.medicalHistory.conditions.push(condition);
        user.medicalHistory.lastUpdated = new Date();
        await user.save();
        res.status(201).json({
            success: true,
            conditions: user.medicalHistory.conditions
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addCondition = addCondition;
const updateCondition = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, diagnosedDate, status, notes } = req.body;
        const user = await User_1.default.findById(req.user?._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        const conditionIndex = user.medicalHistory.conditions.findIndex(c => c._id?.toString() === id);
        if (conditionIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Condition not found'
            });
        }
        if (name)
            user.medicalHistory.conditions[conditionIndex].name = name;
        if (diagnosedDate)
            user.medicalHistory.conditions[conditionIndex].diagnosedDate = new Date(diagnosedDate);
        if (status)
            user.medicalHistory.conditions[conditionIndex].status = status;
        if (notes !== undefined)
            user.medicalHistory.conditions[conditionIndex].notes = notes;
        user.medicalHistory.lastUpdated = new Date();
        await user.save();
        res.status(200).json({
            success: true,
            conditions: user.medicalHistory.conditions
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCondition = updateCondition;
const removeCondition = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User_1.default.findById(req.user?._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        user.medicalHistory.conditions = user.medicalHistory.conditions.filter(c => c._id?.toString() !== id);
        user.medicalHistory.lastUpdated = new Date();
        await user.save();
        res.status(200).json({
            success: true,
            conditions: user.medicalHistory.conditions
        });
    }
    catch (error) {
        next(error);
    }
};
exports.removeCondition = removeCondition;
//# sourceMappingURL=medicalHistoryController.js.map