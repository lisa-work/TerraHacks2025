const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Clinic = require('../models/Clinic');
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

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('providerInfo.clinicId', 'name address');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: user.toObject()
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('phone').optional().isMobilePhone(),
  body('address').optional().isObject(),
  body('preferences').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update allowed fields
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'address', 'preferences'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update medical information (patients only)
router.put('/medical-info', authenticateToken, [
  body('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  body('allergies').optional().isArray(),
  body('medications').optional().isArray(),
  body('conditions').optional().isArray(),
  body('emergencyContact').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.userType !== 'patient') {
      return res.status(403).json({ error: 'Only patients can update medical information' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { bloodType, allergies, medications, conditions, emergencyContact } = req.body;

    if (bloodType) user.medicalInfo.bloodType = bloodType;
    if (allergies) user.medicalInfo.allergies = allergies;
    if (medications) user.medicalInfo.medications = medications;
    if (conditions) user.medicalInfo.conditions = conditions;
    if (emergencyContact) user.medicalInfo.emergencyContact = emergencyContact;

    await user.save();

    res.json({
      message: 'Medical information updated successfully',
      medicalInfo: user.medicalInfo
    });

  } catch (error) {
    console.error('Medical info update error:', error);
    res.status(500).json({ error: 'Failed to update medical information' });
  }
});

// Update insurance information
router.put('/insurance', authenticateToken, [
  body('provider').optional().isString(),
  body('policyNumber').optional().isString(),
  body('groupNumber').optional().isString(),
  body('memberId').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { provider, policyNumber, groupNumber, memberId } = req.body;

    if (provider) user.insurance.provider = provider;
    if (policyNumber) user.insurance.policyNumber = policyNumber;
    if (groupNumber) user.insurance.groupNumber = groupNumber;
    if (memberId) user.insurance.memberId = memberId;

    await user.save();

    res.json({
      message: 'Insurance information updated successfully',
      insurance: user.insurance
    });

  } catch (error) {
    console.error('Insurance update error:', error);
    res.status(500).json({ error: 'Failed to update insurance information' });
  }
});

// Update provider information (doctors only)
router.put('/provider-info', authenticateToken, [
  body('licenseNumber').optional().isString(),
  body('specialties').optional().isArray(),
  body('education').optional().isArray(),
  body('experience').optional().isInt({ min: 0 }),
  body('clinicId').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!['doctor', 'nurse'].includes(req.user.userType)) {
      return res.status(403).json({ error: 'Only healthcare providers can update provider information' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { licenseNumber, specialties, education, experience, clinicId } = req.body;

    if (licenseNumber) user.providerInfo.licenseNumber = licenseNumber;
    if (specialties) user.providerInfo.specialties = specialties;
    if (education) user.providerInfo.education = education;
    if (experience !== undefined) user.providerInfo.experience = experience;
    if (clinicId) {
      // Verify clinic exists
      const clinic = await Clinic.findById(clinicId);
      if (!clinic) {
        return res.status(404).json({ error: 'Clinic not found' });
      }
      user.providerInfo.clinicId = clinicId;
    }

    await user.save();

    res.json({
      message: 'Provider information updated successfully',
      providerInfo: user.providerInfo
    });

  } catch (error) {
    console.error('Provider info update error:', error);
    res.status(500).json({ error: 'Failed to update provider information' });
  }
});

// Search users (admin only)
router.get('/search', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userType, specialty, isActive, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};

    if (userType) query.userType = userType;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (specialty) query['providerInfo.specialties'] = { $in: [specialty] };

    const users = await User.find(query)
      .select('-password -medicalInfo -insurance')
      .populate('providerInfo.clinicId', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Get user by ID (admin only)
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('providerInfo.clinicId', 'name address');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: user.toObject() });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user status (admin only)
router.patch('/:userId/status', authenticateToken, [
  body('isActive').isBoolean(),
  body('isVerified').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;
    const { isActive, isVerified } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isActive = isActive;
    if (isVerified !== undefined) user.isVerified = isVerified;

    await user.save();

    res.json({
      message: 'User status updated successfully',
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Get user statistics (admin only)
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const stats = await User.aggregate([
      {
        $group: {
          _id: '$userType',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          verified: {
            $sum: { $cond: ['$isVerified', 1, 0] }
          }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const totalActive = await User.countDocuments({ isActive: true });
    const totalVerified = await User.countDocuments({ isVerified: true });

    res.json({
      stats,
      totals: {
        users: totalUsers,
        active: totalActive,
        verified: totalVerified
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Get user activity (admin only)
router.get('/stats/activity', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const activity = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({ activity });

  } catch (error) {
    console.error('Get user activity error:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
});

// Delete user (admin only)
router.delete('/:userId', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Soft delete - mark as inactive instead of actually deleting
    user.isActive = false;
    await user.save();

    res.json({
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router; 