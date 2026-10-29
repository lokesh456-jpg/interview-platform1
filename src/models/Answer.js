const mongoose = require('mongoose');

const rubricScoreSchema = new mongoose.Schema({
  correctness: { type: Number, min: 0, max: 100, default: null },
  relevance: { type: Number, min: 0, max: 100, default: null },
  completeness: { type: Number, min: 0, max: 100, default: null },
  clarity: { type: Number, min: 0, max: 100, default: null },
  reasoning: { type: Number, min: 0, max: 100, default: null },
  structure: { type: Number, min: 0, max: 100, default: null },
}, { _id: false });

const evaluationSchema = new mongoose.Schema({
  score: { type: Number, min: 0, max: 100 },
  strengths: [String],
  improvements: [String],
  missingConcepts: [String],
  suggestedAnswer: String,
  rubricScores: rubricScoreSchema,
  followUpQuestion: String,
  aiDisclaimer: {
    type: String,
    default: 'This evaluation is AI-generated practice feedback and may contain errors. It is not an objective measure of your skills.',
  },
}, { _id: false });

const answerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true,
    index: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  textAnswer: {
    type: String,
    default: '',
  },
  transcript: {
    type: String, // Voice transcript if used
    default: null,
  },
  submissionStatus: {
    type: String,
    enum: ['submitted', 'skipped'],
    default: 'submitted',
  },
  evaluationStatus: {
    type: String,
    enum: ['pending', 'evaluating', 'completed', 'failed'],
    default: 'pending',
  },
  evaluation: {
    type: evaluationSchema,
    default: null,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  evaluatedAt: Date,
}, {
  timestamps: true,
});

// Compound index to prevent duplicate answers per question per interview
answerSchema.index({ interviewId: 1, questionId: 1 }, { unique: true });
answerSchema.index({ userId: 1, interviewId: 1 });

const Answer = mongoose.model('Answer', answerSchema);
module.exports = Answer;
