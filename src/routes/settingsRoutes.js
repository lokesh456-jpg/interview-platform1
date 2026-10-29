const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/authenticate');
const { validateRequest } = require('../middleware/validateRequest');
const { getSettings, updateProfile, updatePreferences, updatePrivacy, deleteAccount, exportData } = require('../controllers/settingsController');

router.use(authenticate);
router.get('/', getSettings);
router.patch('/profile', updateProfile);
router.patch('/preferences', updatePreferences);
router.patch('/privacy', updatePrivacy);
router.post('/export-data', exportData);
router.delete('/account', [
  body('confirmPassword').notEmpty().withMessage('Password confirmation required'),
], validateRequest, deleteAccount);

module.exports = router;
