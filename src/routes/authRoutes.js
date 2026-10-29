const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, logout, getMe, forgotPassword, resetPassword, changePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/authenticate');
const { validateRequest } = require('../middleware/validateRequest');
const { authLimiter } = require('../middleware/rateLimiter');

const passwordRules = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and a number');

router.post('/register', authLimiter, [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name too long'),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  passwordRules,
], validateRequest, register);

router.post('/login', authLimiter, [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
], validateRequest, login);

router.post('/logout', logout);
router.get('/me', authenticate, getMe);

router.post('/forgot-password', authLimiter, [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
], validateRequest, forgotPassword);

router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token required'),
  passwordRules,
], validateRequest, resetPassword);

router.post('/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  passwordRules.withMessage('New password must be at least 8 characters with uppercase, lowercase, and number').optional(),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
], validateRequest, changePassword);

module.exports = router;
