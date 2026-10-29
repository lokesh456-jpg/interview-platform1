const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  level: { type: Number, min: 0, max: 100, default: 50 },
  selfReported: { type: Boolean, default: true },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    select: false,
  },
  profileImage: {
    type: String,
    default: null,
  },
  preferredRoles: {
    type: [String],
    default: [],
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'principal'],
    default: 'mid',
  },
  preferredLanguage: {
    type: String,
    default: 'English',
  },
  preferredDifficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  preferredDuration: {
    type: Number,
    enum: [15, 30, 45, 60],
    default: 30,
  },
  preferredAnswerMode: {
    type: String,
    enum: ['text', 'voice'],
    default: 'text',
  },
  preferredCategories: {
    type: [String],
    default: ['technical', 'behavioral'],
  },
  areasOfFocus: {
    type: [String],
    default: [],
  },
  skills: {
    type: [skillSchema],
    default: [],
  },
  plan: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active',
  },
  resumeRetentionPreference: {
    type: Boolean,
    default: true,
  },
  audioRecordingConsent: {
    type: Boolean,
    default: false,
  },
  interviewUsageCount: {
    type: Number,
    default: 0,
  },
  resumeAnalysisCount: {
    type: Number,
    default: 0,
  },
  lastLoginAt: Date,
}, {
  timestamps: true,
});

// Indexes
userSchema.index({ accountStatus: 1 });

// Instance methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

// Static methods
userSchema.statics.hashPassword = async (password) => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
