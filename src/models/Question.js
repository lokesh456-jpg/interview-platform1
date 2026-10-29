const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    required: true,
    index: true,
  },
  order: {
    type: Number,
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['technical', 'behavioral', 'hr', 'coding', 'system_design', 'mixed'],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  evaluationCriteria: {
    type: [String],
    default: [],
  },
  expectedConcepts: {
    type: [String],
    default: [],
  },
  followUpQuestion: {
    type: String,
    default: null,
  },
  source: {
    type: String,
    enum: ['ai_generated', 'template'],
    default: 'ai_generated',
  },
}, {
  timestamps: true,
});

questionSchema.index({ interviewId: 1, order: 1 });

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
