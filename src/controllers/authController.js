const jwt = require('jsonwebtoken');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { sendPasswordResetEmail } = require('../services/emailService');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ name: name.trim(), email: email.toLowerCase(), passwordHash });

    const token = signToken(user._id);
    res.cookie('token', token, COOKIE_OPTIONS);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user || user.accountStatus !== 'active') {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken(user._id);
    res.cookie('token', token, COOKIE_OPTIONS);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  res.clearCookie('token', { ...COOKIE_OPTIONS, maxAge: 0 });
  res.json({ success: true, message: 'Logged out successfully.' });
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user.toPublicJSON() });
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Always respond with same message to prevent user enumeration
    const successMsg = "If an account exists with that email, you'll receive reset instructions shortly.";

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ success: true, message: successMsg });
    }

    // Invalidate previous reset tokens
    await PasswordReset.deleteMany({ userId: user._id });

    const { rawToken, tokenHash } = PasswordReset.generateToken();
    await PasswordReset.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    const resetUrl = `${process.env.PASSWORD_RESET_BASE_URL}?token=${rawToken}`;

    await sendPasswordResetEmail({ to: user.email, resetUrl, name: user.name });

    // In development, log token for testing
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n🔑 [DEV] Password reset token: ${rawToken}`);
      console.log(`🔗 [DEV] Reset URL: ${resetUrl}\n`);
    }

    res.json({ success: true, message: successMsg });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const tokenHash = PasswordReset.hashToken(token);
    const resetRecord = await PasswordReset.findOne({
      tokenHash,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset link.' });
    }

    const user = await User.findById(resetRecord.userId);
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found.' });
    }

    user.passwordHash = await User.hashPassword(password);
    await user.save();

    // Mark token as used
    resetRecord.used = true;
    await resetRecord.save();

    // Invalidate any remaining tokens
    await PasswordReset.deleteMany({ userId: user._id });

    res.json({ success: true, message: 'Password reset successfully. Please log in.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+passwordHash');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();

    // Invalidate existing session
    res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 0 });

    res.json({ success: true, message: 'Password changed successfully. Please log in again.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getMe, forgotPassword, resetPassword, changePassword };
