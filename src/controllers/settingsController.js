const User = require('../models/User');
const Resume = require('../models/Resume');
const Interview = require('../models/Interview');
const Answer = require('../models/Answer');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

// GET /api/settings
const getSettings = async (req, res) => {
  res.json({ success: true, user: req.user.toPublicJSON() });
};

// PATCH /api/settings/profile
const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'preferredRoles', 'experienceLevel', 'preferredLanguage', 'profileImage'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated.', user: user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/settings/preferences
const updatePreferences = async (req, res, next) => {
  try {
    const allowed = ['preferredDifficulty', 'preferredDuration', 'preferredCategories', 'preferredAnswerMode', 'areasOfFocus', 'skills'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Preferences updated.', user: user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/settings/privacy
const updatePrivacy = async (req, res, next) => {
  try {
    const { resumeRetentionPreference, audioRecordingConsent } = req.body;
    const updates = {};
    if (resumeRetentionPreference !== undefined) updates.resumeRetentionPreference = resumeRetentionPreference;
    if (audioRecordingConsent !== undefined) updates.audioRecordingConsent = audioRecordingConsent;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ success: true, message: 'Privacy settings updated.', user: user.toPublicJSON() });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/settings/account
const deleteAccount = async (req, res, next) => {
  try {
    const { confirmPassword } = req.body;
    const user = await User.findById(req.user._id).select('+passwordHash');
    const isMatch = await user.comparePassword(confirmPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Password is incorrect.' });
    }

    // Delete all user data
    const resumes = await Resume.find({ userId: user._id });

    // Delete Cloudinary files
    if (isCloudinaryConfigured()) {
      for (const resume of resumes) {
        if (resume.cloudinaryPublicId) {
          try {
            await cloudinary.uploader.destroy(resume.cloudinaryPublicId, { resource_type: 'raw' });
          } catch (_) {}
        }
      }
    }

    await Promise.all([
      Resume.deleteMany({ userId: user._id }),
      Interview.deleteMany({ userId: user._id }),
      Answer.deleteMany({ userId: user._id }),
      Report.deleteMany({ userId: user._id }),
      Notification.deleteMany({ userId: user._id }),
    ]);

    user.accountStatus = 'deleted';
    user.email = `deleted_${user._id}@deleted.interviewai.com`;
    await user.save();

    res.clearCookie('token');
    res.json({ success: true, message: 'Account permanently deleted.' });
  } catch (error) {
    next(error);
  }
};

// POST /api/settings/export-data
const exportData = async (req, res, next) => {
  try {
    const [user, resumes, interviews, reports] = await Promise.all([
      User.findById(req.user._id).select('-passwordHash'),
      Resume.find({ userId: req.user._id }).select('-extractedText'),
      Interview.find({ userId: req.user._id }),
      Report.find({ userId: req.user._id }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: user.toPublicJSON(),
      resumes,
      interviews,
      reports,
      disclaimer: 'This data export is for personal use only.',
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="interviewai-data-export.json"');
    res.json(exportData);
  } catch (error) {
    next(error);
  }
};

module.exports = { getSettings, updateProfile, updatePreferences, updatePrivacy, deleteAccount, exportData };
