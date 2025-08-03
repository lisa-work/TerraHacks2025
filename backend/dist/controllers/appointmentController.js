"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAppointment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Appointment_1 = __importDefault(require("../models/Appointment"));
const createAppointment = async (req, res, next) => {
    try {
        const { clinicId, appointmentDate, appointmentTime, type, notes } = req.body;
        const clinicObjectId = mongoose_1.default.Types.ObjectId.isValid(clinicId)
            ? new mongoose_1.default.Types.ObjectId(clinicId)
            : new mongoose_1.default.Types.ObjectId();
        const appointment = await Appointment_1.default.create({
            user: req.user._id,
            clinic: clinicObjectId,
            appointmentDate,
            appointmentTime,
            duration: 30,
            type,
            status: 'scheduled',
            priority: 'medium',
            symptoms: [],
            notes,
            estimatedCost: 0,
            insuranceCoverage: {
                provider: req.user?.insurance?.provider || 'Unknown',
                coveragePercentage: 0,
                copay: 0,
                deductible: 0
            },
            paymentStatus: 'pending',
            remindersSent: { email: false, sms: false, push: false },
            followUpRequired: false
        });
        res.status(201).json({ success: true, data: appointment });
    }
    catch (error) {
        next(error);
    }
};
exports.createAppointment = createAppointment;
//# sourceMappingURL=appointmentController.js.map