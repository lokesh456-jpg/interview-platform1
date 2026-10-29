const mongoose = require('mongoose');

const questionSummarySchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  questionText: String,
  userAnswer: String,
  score: Number,
  strengths: [String],
  improvements: [String],
  missingConcepts: [String],
  suggestedAnswer: String,
  rubricScores: {
    correctness: Number,
    relevance: Number,
    completeness: Number,
    clarity: Number,
    reasoning: Number,
    structure: Number,
  },
}, { _id: false });

const reportSchema = new mongoose.Schema({
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
    unique: true,
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null,
  },
  skillScores: {
    technicalKnowledge: { type: Number, min: 0, max: 100, default: null },
    problemSolving: { type: Number, min: 0, max: 100, default: null },
    communication: { type: Number, min: 0, max: 100, default: null },
    confidence: { type: Number, min: 0, max: 100, default: null },
  },
  strengths: {
    type: [String],
    default: [],
  },
  improvementAreas: {
    type: [String],
    default: [],
  },
  questionSummaries: {
    type: [questionSummarySchema],
    default: [],
  },
  recommendedTopics: {
    type: [String],
    default: [],
  },
  suggestedNextInterview: {
    type: String,
    default: null,
  },
  reportStatus: {
    type: String,
    enum: ['generating', 'completed', 'failed'],
    default: 'generating',
  },
  aiDisclaimer: {
    type: String,
    default: 'This report is AI-generated and provides practice guidance. Scores are estimates and do not objectively measure your professional abilities.',
  },
}, {
  timestamps: true,
});

reportSchema.index({ userId: 1, createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
