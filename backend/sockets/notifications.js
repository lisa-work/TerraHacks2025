const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

/**
 * WebSocket notification handler
 * @param {object} io - Socket.io instance
 */
module.exports = function(io) {
  // Store connected users
  const connectedUsers = new Map();
  
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.userId = decoded.userId;
      socket.userType = decoded.userType;
      socket.email = decoded.email;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.email} (${socket.userId})`);
    
    // Store connected user
    connectedUsers.set(socket.userId, {
      socketId: socket.id,
      userType: socket.userType,
      email: socket.email,
      connectedAt: new Date()
    });

    // Join user to their personal room
    socket.join(`user_${socket.userId}`);
    
    // Join user to role-based rooms
    socket.join(`role_${socket.userType}`);
    
    // If user is a doctor, join them to their clinic room
    if (socket.userType === 'doctor') {
      socket.join(`clinic_doctors`);
    }

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to healthcare notifications',
      userId: socket.userId,
      userType: socket.userType,
      timestamp: new Date().toISOString()
    });

    // Handle appointment status updates
    socket.on('appointment_update', async (data) => {
      try {
        const { appointmentId, status, reason } = data;
        
        const appointment = await Appointment.findOne({ appointmentId })
          .populate('patientId', 'firstName lastName email')
          .populate('doctorId', 'firstName lastName email');
        
        if (!appointment) {
          socket.emit('error', { message: 'Appointment not found' });
          return;
        }

        // Check if user has permission to update this appointment
        if (appointment.patientId._id.toString() !== socket.userId && 
            appointment.doctorId._id.toString() !== socket.userId) {
          socket.emit('error', { message: 'Permission denied' });
          return;
        }

        // Update appointment status
        appointment.status = status;
        if (reason) {
          appointment.statusHistory.push({
            status,
            changedBy: socket.userId,
            reason
          });
        }
        await appointment.save();

        // Notify relevant users
        const notification = {
          type: 'appointment_update',
          appointmentId: appointment.appointmentId,
          status: status,
          reason: reason,
          timestamp: new Date().toISOString(),
          updatedBy: socket.userId
        };

        // Notify patient
        io.to(`user_${appointment.patientId._id}`).emit('notification', {
          ...notification,
          message: `Your appointment with Dr. ${appointment.doctorId.lastName} has been updated to ${status}`
        });

        // Notify doctor
        io.to(`user_${appointment.doctorId._id}`).emit('notification', {
          ...notification,
          message: `Appointment with ${appointment.patientId.firstName} ${appointment.patientId.lastName} updated to ${status}`
        });

        // Broadcast to all connected users in the clinic
        io.to('clinic_doctors').emit('appointment_updated', {
          appointment: appointment.toObject(),
          notification
        });

      } catch (error) {
        console.error('Appointment update error:', error);
        socket.emit('error', { message: 'Failed to update appointment' });
      }
    });

    // Handle new appointment creation
    socket.on('appointment_created', async (data) => {
      try {
        const { appointmentId } = data;
        
        const appointment = await Appointment.findOne({ appointmentId })
          .populate('patientId', 'firstName lastName email')
          .populate('doctorId', 'firstName lastName email');
        
        if (!appointment) {
          socket.emit('error', { message: 'Appointment not found' });
          return;
        }

        const notification = {
          type: 'appointment_created',
          appointmentId: appointment.appointmentId,
          timestamp: new Date().toISOString(),
          createdBy: socket.userId
        };

        // Notify doctor about new appointment
        io.to(`user_${appointment.doctorId._id}`).emit('notification', {
          ...notification,
          message: `New appointment scheduled with ${appointment.patientId.firstName} ${appointment.patientId.lastName}`
        });

        // Notify patient about confirmation
        io.to(`user_${appointment.patientId._id}`).emit('notification', {
          ...notification,
          message: `Your appointment with Dr. ${appointment.doctorId.lastName} has been scheduled`
        });

      } catch (error) {
        console.error('Appointment creation notification error:', error);
        socket.emit('error', { message: 'Failed to send appointment notification' });
      }
    });

    // Handle emergency alerts
    socket.on('emergency_alert', async (data) => {
      try {
        const { symptoms, location, patientInfo } = data;
        
        const emergencyNotification = {
          type: 'emergency_alert',
          symptoms,
          location,
          patientInfo,
          timestamp: new Date().toISOString(),
          reportedBy: socket.userId
        };

        // Broadcast emergency to all doctors
        io.to('clinic_doctors').emit('emergency_alert', {
          ...emergencyNotification,
          message: 'EMERGENCY ALERT: Patient requires immediate attention',
          priority: 'high'
        });

        // Also notify admins
        io.to('role_admin').emit('emergency_alert', emergencyNotification);

      } catch (error) {
        console.error('Emergency alert error:', error);
        socket.emit('error', { message: 'Failed to send emergency alert' });
      }
    });

    // Handle chat messages
    socket.on('chat_message', async (data) => {
      try {
        const { recipientId, message, appointmentId } = data;
        
        const chatNotification = {
          type: 'chat_message',
          senderId: socket.userId,
          recipientId,
          message,
          appointmentId,
          timestamp: new Date().toISOString()
        };

        // Send to recipient
        io.to(`user_${recipientId}`).emit('chat_message', {
          ...chatNotification,
          senderName: socket.email.split('@')[0] // Simple name extraction
        });

        // Send confirmation to sender
        socket.emit('message_sent', {
          messageId: Date.now().toString(),
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('Chat message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { recipientId, isTyping } = data;
      io.to(`user_${recipientId}`).emit('typing', {
        userId: socket.userId,
        isTyping,
        timestamp: new Date().toISOString()
      });
    });

    // Handle user status updates
    socket.on('status_update', async (data) => {
      try {
        const { status, availability } = data;
        
        // Update user status in database
        await User.findByIdAndUpdate(socket.userId, {
          lastLogin: new Date(),
          // Add status field if needed
        });

        const statusNotification = {
          type: 'status_update',
          userId: socket.userId,
          status,
          availability,
          timestamp: new Date().toISOString()
        };

        // Broadcast status to relevant users
        if (socket.userType === 'doctor') {
          io.to('clinic_doctors').emit('doctor_status', statusNotification);
        }

        // Update connected users map
        const userInfo = connectedUsers.get(socket.userId);
        if (userInfo) {
          userInfo.status = status;
          userInfo.availability = availability;
          connectedUsers.set(socket.userId, userInfo);
        }

      } catch (error) {
        console.error('Status update error:', error);
        socket.emit('error', { message: 'Failed to update status' });
      }
    });

    // Handle room joining for specific appointments
    socket.on('join_appointment_room', (data) => {
      const { appointmentId } = data;
      socket.join(`appointment_${appointmentId}`);
      socket.emit('joined_room', { room: `appointment_${appointmentId}` });
    });

    // Handle room leaving
    socket.on('leave_appointment_room', (data) => {
      const { appointmentId } = data;
      socket.leave(`appointment_${appointmentId}`);
      socket.emit('left_room', { room: `appointment_${appointmentId}` });
    });

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.email} (${socket.userId})`);
      
      // Remove from connected users
      connectedUsers.delete(socket.userId);
      
      // Notify relevant users about disconnection
      if (socket.userType === 'doctor') {
        io.to('clinic_doctors').emit('doctor_disconnected', {
          userId: socket.userId,
          email: socket.email,
          timestamp: new Date().toISOString()
        });
      }
    });
  });

  // Utility functions for external use
  const notificationService = {
    /**
     * Send notification to specific user
     * @param {string} userId - User ID to notify
     * @param {object} notification - Notification data
     */
    sendToUser: (userId, notification) => {
      io.to(`user_${userId}`).emit('notification', {
        ...notification,
        timestamp: new Date().toISOString()
      });
    },

    /**
     * Send notification to all users of a specific type
     * @param {string} userType - User type to notify
     * @param {object} notification - Notification data
     */
    sendToUserType: (userType, notification) => {
      io.to(`role_${userType}`).emit('notification', {
        ...notification,
        timestamp: new Date().toISOString()
      });
    },

    /**
     * Send notification to all connected users
     * @param {object} notification - Notification data
     */
    broadcastToAll: (notification) => {
      io.emit('notification', {
        ...notification,
        timestamp: new Date().toISOString()
      });
    },

    /**
     * Get connected users count
     * @returns {number} Number of connected users
     */
    getConnectedUsersCount: () => {
      return connectedUsers.size;
    },

    /**
     * Get connected users info
     * @returns {Array} Array of connected users info
     */
    getConnectedUsers: () => {
      return Array.from(connectedUsers.entries()).map(([userId, info]) => ({
        userId,
        ...info
      }));
    },

    /**
     * Send appointment reminder
     * @param {string} appointmentId - Appointment ID
     * @param {object} appointment - Appointment data
     */
    sendAppointmentReminder: (appointmentId, appointment) => {
      const reminder = {
        type: 'appointment_reminder',
        appointmentId,
        appointment,
        message: `Reminder: You have an appointment in 1 hour`,
        priority: 'medium'
      };

      // Notify patient
      if (appointment.patientId) {
        io.to(`user_${appointment.patientId}`).emit('notification', reminder);
      }

      // Notify doctor
      if (appointment.doctorId) {
        io.to(`user_${appointment.doctorId}`).emit('notification', reminder);
      }
    },

    /**
     * Send emergency notification
     * @param {object} emergencyData - Emergency data
     */
    sendEmergencyNotification: (emergencyData) => {
      const emergency = {
        type: 'emergency',
        ...emergencyData,
        priority: 'high',
        timestamp: new Date().toISOString()
      };

      // Broadcast to all doctors and admins
      io.to('clinic_doctors').emit('emergency', emergency);
      io.to('role_admin').emit('emergency', emergency);
    }
  };

  // Make notification service available globally
  global.notificationService = notificationService;

  return notificationService;
}; 