import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import { sendTokenResponse, verifyRefreshToken, generateToken } from '../utils/jwt';
import { sendEmail } from '../utils/email';
import { AuthRequest } from '../middleware/auth';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const {
      name,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      location,
      insurance,
      medicalHistory,
      preferences
    } = req.body;

    // Validate password strength
    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (!hasUppercase) {
      return res.status(400).json({
        success: false,
        error: 'Password must contain at least one uppercase letter'
      });
    }

    if (!hasNumber) {
      return res.status(400).json({
        success: false,
        error: 'Password must contain at least one number'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          error: 'An account with this email already exists'
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'An account with this phone number already exists'
        });
      }
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      location,
      insurance,
      medicalHistory: medicalHistory || {
        allergies: [],
        medications: [],
        conditions: [],
        surgeries: [],
        familyHistory: [],
        emergencyContact: {
          name: '',
          relationship: '',
          phone: ''
        },
        lastUpdated: new Date()
      },
      preferences: preferences || {
        language: 'en',
        notifications: {
          email: true,
          sms: true,
          push: true
        },
        privacySettings: {
          shareDataForResearch: false,
          allowMarketingCommunications: false
        }
      },
      verificationToken,
      isVerified: false
    });

    // Send verification email
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      
      await sendEmail({
        email: user.email,
        subject: 'MediConnect - Verify Your Email',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1D6FA3;">Welcome to MediConnect!</h2>
            <p>Thank you for registering with MediConnect. Please click the button below to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #1D6FA3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email
              </a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required'
      });
    }

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid verification token'
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        error: 'User is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    await sendEmail({
      email: user.email,
      subject: 'MediConnect - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1D6FA3;">Verify Your Email</h2>
          <p>Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #1D6FA3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        </div>
      `
    });

    res.status(200).json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: 'MediConnect - Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1D6FA3;">Password Reset Request</h2>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #1D6FA3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p style="color: #666; font-size: 14px;">This link will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you did not request this reset, please ignore this email.</p>
        </div>
      `
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password
// @access  Public
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { token, password } = req.body;

    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.cookie('refreshToken', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    try {
      const decoded = verifyRefreshToken(token);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid refresh token'
        });
      }

      const newToken = generateToken((user as any)._id.toString());

      res.status(200).json({
        success: true,
        token: newToken
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }
  } catch (error) {
    next(error);
  }
};