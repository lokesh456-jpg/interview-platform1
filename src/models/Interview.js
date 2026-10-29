const mongoose = require('mongoose');

const INTERVIEW_STATUSES = [
  'draft',
  'generating_questions',
  'ready',
  'in_progress',
  'evaluating',
  'completed',
  'failed',
  'cancelled',
];

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    default: null,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  jobRole: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  interviewType: {
    type: String,
    enum: ['technical', 'behavioral', 'hr', 'coding', 'system_design', 'mixed'],
    required: true,
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'junior', 'mid', 'senior', 'lead', 'principal'],
    default: 'mid',
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  durationLimit: {
    type: Number,
    enum: [15, 30, 45, 60],
    default: 30,
  },
  questionCount: {
    type: Number,
    enum: [5, 10, 15, 20],
    default: 10,
  },
  preferredLanguage: {
    type: String,
    default: 'English',
  },
  answerMode: {
    type: String,
    enum: ['text', 'voice'],
    default: 'text',
  },
  skillsToPractice: {
    type: [String],
    default: [],
  },
  currentQuestionIndex: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: INTERVIEW_STATUSES,
    default: 'draft',
  },
  startedAt: Date,
  completedAt: Date,
  totalDuration: {
    type: Number, // in seconds
    default: 0,
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null,
  },
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    default: null,
  },
  errorMessage: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

interviewSchema.index({ userId: 1, status: 1 });
interviewSchema.index({ userId: 1, createdAt: -1 });
interviewSchema.index({ userId: 1, interviewType: 1 });

const Interview = mongoose.model('Interview', interviewSchema);
module.exports = Interview;
