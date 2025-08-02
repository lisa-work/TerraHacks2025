const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Clinic = require('../models/Clinic');
const { performAITriage } = require('../services/gemini');
const { getGeocode } = require('../services/maps');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Create new appointment with AI triage
router.post('/create', authenticateToken, [
  body('doctorId').isMongoId(),
  body('appointmentType').isIn(['consultation', 'checkup', 'emergency', 'followup', 'procedure', 'surgery', 'telemedicine']),
  body('specialty').notEmpty(),
  body('scheduledDate').isISO8601(),
  body('symptoms').optional().isString(),
  body('location').optional().isObject(),
  body('duration').optional().isInt({ min: 15, max: 480 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      doctorId,
      appointmentType,
      specialty,
      scheduledDate,
      symptoms,
      location = { type: 'in_person' },
      duration = 30
    } = req.body;

    // Verify doctor exists and is active
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.userType !== 'doctor' || !doctor.isActive) {
      return res.status(404).json({ error: 'Doctor not found or inactive' });
    }

    // Check for scheduling conflicts
    const appointmentDate = new Date(scheduledDate);
    const endTime = new Date(appointmentDate.getTime() + duration * 60000);

    const conflictingAppointment = await Appointment.findOne({
      doctorId,
      status: { $in: ['scheduled', 'confirmed'] },
      $or: [
        {
          scheduledDate: { $lt: endTime },
          $expr: {
            $gte: {
              $add: ['$scheduledDate', { $multiply: ['$duration', 60000] }]
            },
            appointmentDate
          }
        }
      ]
    });

    if (conflictingAppointment) {
      return res.status(409).json({ error: 'Time slot not available' });
    }

    // Perform AI triage if symptoms provided
    let aiTriage = null;
    if (symptoms) {
      try {
        aiTriage = await performAITriage(symptoms, specialty);
      } catch (error) {
        console.error('AI triage error:', error);
        // Continue without AI triage if it fails
      }
    }

    // Geocode address if provided
    let geocodedAddress = null;
    if (location.address) {
      try {
        geocodedAddress = await getGeocode(location.address);
        if (geocodedAddress) {
          location.address = { ...location.address, ...geocodedAddress };
        }
      } catch (error) {
        console.error('Geocoding error:', error);
      }
    }

    // Create appointment
    const appointment = new Appointment({
      patientId: req.user.userId,
      doctorId,
      appointmentType,
      specialty,
      scheduledDate: appointmentDate,
      duration,
      symptoms,
      location,
      aiTriage,
      timezone: req.user.timezone || 'UTC'
    });

    await appointment.save();

    // Populate user details for response
    await appointment.populate('patientId', 'firstName lastName');
    await appointment.populate('doctorId', 'firstName lastName');

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: appointment.toObject()
    });

  } catch (error) {
    console.error('Appointment creation error:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Get user's appointments
router.get('/my-appointments', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { patientId: req.user.userId },
        { doctorId: req.user.userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'firstName lastName')
      .populate('doctorId', 'firstName lastName')
      .populate('clinicId', 'name')
      .sort({ scheduledDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.json({
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get specific appointment
router.get('/:appointmentId', authenticateToken, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findOne({
      appointmentId,
      $or: [
        { patientId: req.user.userId },
        { doctorId: req.user.userId }
      ]
    })
    .populate('patientId', 'firstName lastName email phone')
    .populate('doctorId', 'firstName lastName email phone')
    .populate('clinicId', 'name address contact');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ appointment });

  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// Update appointment status
router.patch('/:appointmentId/status', authenticateToken, [
  body('status').isIn(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled']),
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { appointmentId } = req.params;
    const { status, reason } = req.body;

    const appointment = await Appointment.findOne({
      appointmentId,
      $or: [
        { patientId: req.user.userId },
        { doctorId: req.user.userId }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Only doctors can change status to in_progress or completed
    if (['in_progress', 'completed'].includes(status) && req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    appointment.status = status;
    if (reason) {
      appointment.statusHistory.push({
        status,
        changedBy: req.user.userId,
        reason
      });
    }

    await appointment.save();

    res.json({
      message: 'Appointment status updated',
      appointment: appointment.toObject()
    });

  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ error: 'Failed to update appointment status' });
  }
});

// Cancel appointment
router.post('/:appointmentId/cancel', authenticateToken, [
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { reason } = req.body;

    const appointment = await Appointment.findOne({
      appointmentId,
      $or: [
        { patientId: req.user.userId },
        { doctorId: req.user.userId }
      ],
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found or cannot be cancelled' });
    }

    appointment.status = 'cancelled';
    appointment.cancellation = {
      cancelledBy: req.user.userId,
      cancelledAt: new Date(),
      reason: reason || 'Cancelled by user'
    };

    await appointment.save();

    res.json({
      message: 'Appointment cancelled successfully',
      appointment: appointment.toObject()
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// Reschedule appointment
router.post('/:appointmentId/reschedule', authenticateToken, [
  body('newDate').isISO8601(),
  body('reason').optional().isString()
], async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { newDate, reason } = req.body;

    const appointment = await Appointment.findOne({
      appointmentId,
      $or: [
        { patientId: req.user.userId },
        { doctorId: req.user.userId }
      ],
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found or cannot be rescheduled' });
    }

    // Check for conflicts with new time
    const newAppointmentDate = new Date(newDate);
    const endTime = new Date(newAppointmentDate.getTime() + appointment.duration * 60000);

    const conflictingAppointment = await Appointment.findOne({
      doctorId: appointment.doctorId,
      _id: { $ne: appointment._id },
      status: { $in: ['scheduled', 'confirmed'] },
      $or: [
        {
          scheduledDate: { $lt: endTime },
          $expr: {
            $gte: {
              $add: ['$scheduledDate', { $multiply: ['$duration', 60000] }]
            },
            newAppointmentDate
          }
        }
      ]
    });

    if (conflictingAppointment) {
      return res.status(409).json({ error: 'New time slot not available' });
    }

    appointment.scheduledDate = newAppointmentDate;
    appointment.status = 'rescheduled';
    appointment.statusHistory.push({
      status: 'rescheduled',
      changedBy: req.user.userId,
      reason: reason || 'Rescheduled by user'
    });

    await appointment.save();

    res.json({
      message: 'Appointment rescheduled successfully',
      appointment: appointment.toObject()
    });

  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({ error: 'Failed to reschedule appointment' });
  }
});

// Add medical notes (doctors only)
router.post('/:appointmentId/notes', authenticateToken, [
  body('diagnosis').optional().isString(),
  body('treatment').optional().isString(),
  body('notes').optional().isString(),
  body('prescriptions').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.userType !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can add medical notes' });
    }

    const { appointmentId } = req.params;
    const { diagnosis, treatment, notes, prescriptions } = req.body;

    const appointment = await Appointment.findOne({
      appointmentId,
      doctorId: req.user.userId
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (diagnosis) appointment.diagnosis = diagnosis;
    if (treatment) appointment.treatment = treatment;
    if (notes) appointment.notes = notes;
    if (prescriptions) appointment.prescriptions = prescriptions;

    await appointment.save();

    res.json({
      message: 'Medical notes added successfully',
      appointment: appointment.toObject()
    });

  } catch (error) {
    console.error('Add medical notes error:', error);
    res.status(500).json({ error: 'Failed to add medical notes' });
  }
});

// Get available time slots for a doctor
router.get('/available-slots/:doctorId', authenticateToken, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date, duration = 30 } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    // Get doctor's appointments for the day
    const appointments = await Appointment.find({
      doctorId,
      scheduledDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['scheduled', 'confirmed'] }
    }).sort({ scheduledDate: 1 });

    // Generate available time slots
    const workingHours = { start: 9, end: 17 }; // 9 AM to 5 PM
    const slotDuration = parseInt(duration);
    const availableSlots = [];

    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotStart = new Date(targetDate);
        slotStart.setHours(hour, minute, 0, 0);
        
        const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);

        // Check if slot conflicts with existing appointments
        const hasConflict = appointments.some(appointment => {
          const appointmentEnd = new Date(appointment.scheduledDate.getTime() + appointment.duration * 60000);
          return (slotStart < appointmentEnd && slotEnd > appointment.scheduledDate);
        });

        if (!hasConflict) {
          availableSlots.push({
            startTime: slotStart,
            endTime: slotEnd,
            available: true
          });
        }
      }
    }

    res.json({
      date: targetDate,
      availableSlots,
      totalSlots: availableSlots.length
    });

  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ error: 'Failed to get available slots' });
  }
});

// Search doctors by specialty and location
router.get('/search-doctors', authenticateToken, async (req, res) => {
  try {
    const { specialty, location, radius = 50, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      userType: 'doctor',
      isActive: true
    };

    if (specialty) {
      query['providerInfo.specialties'] = { $in: [specialty] };
    }

    let doctors = await User.find(query)
      .select('firstName lastName providerInfo address')
      .skip(skip)
      .limit(parseInt(limit));

    // If location provided, filter by distance
    if (location && location.latitude && location.longitude) {
      doctors = doctors.filter(doctor => {
        if (doctor.address && doctor.address.coordinates) {
          const distance = doctor.getDistance(location.latitude, location.longitude);
          return distance && distance <= radius;
        }
        return true;
      });
    }

    const total = await User.countDocuments(query);

    res.json({
      doctors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Search doctors error:', error);
    res.status(500).json({ error: 'Failed to search doctors' });
  }
});

module.exports = router; 