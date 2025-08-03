import express from 'express';
import { protect } from '../middleware/auth';
import { createAppointment, getAppointments } from '../controllers/appointmentController';

const router = express.Router();

// Get all appointments for the authenticated user
router.get('/', protect, getAppointments);

// Create a new appointment
router.post('/', protect, createAppointment);

export default router;