import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment';
import { AuthRequest } from '../middleware/auth';

export const createAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { clinicId, appointmentDate, appointmentTime, type, notes } = req.body;

    const clinicObjectId = mongoose.Types.ObjectId.isValid(clinicId)
      ? new mongoose.Types.ObjectId(clinicId)
      : new mongoose.Types.ObjectId();

    const appointment = await Appointment.create({
      user: req.user!._id,
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
  } catch (error) {
    next(error);
  }
};
