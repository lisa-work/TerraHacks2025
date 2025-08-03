import express from 'express';
import { protect } from '../middleware/auth';
import { createAppointment } from '../controllers/appointmentController';

const router = express.Router();

// Create a new appointment
router.post('/', protect, createAppointment);

export default router;