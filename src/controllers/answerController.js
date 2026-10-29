const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Interview = require('../models/Interview');
const { evaluateInterviewAnswer } = require('../services/aiService');
const { isAIConfigured } = require('../config/aiProvider');

// POST /api/interviews/:id/answers
const submitAnswer = async (req, res, next) => {
  try {
    const { questionId, textAnswer, transcript, submissionStatus = 'submitted' } = req.body;
    const interviewId = req.params.id;

    // Verify interview ownership and state
    const interview = await Interview.findOne({ _id: interviewId, userId: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found.' });
    if (interview.status !== 'in_progress') {
      return res.status(409).json({ success: false, message: 'Interview is not in progress.' });
    }

    // Verify question belongs to interview
    const question = await Question.findOne({ _id: questionId, interviewId });
    if (!question) return res.status(404).json({ success: false, message: 'Question not found.' });

    // Idempotent: check for existing answer
    let answer = await Answer.findOne({ interviewId, questionId });
    if (answer) {
      // Already submitted - return existing (prevent double billing)
      return res.json({ success: true, message: 'Answer already submitted.', answer });
    }

    const effectiveAnswer = textAnswer || transcript || '';
    if (!effectiveAnswer.trim() && submissionStatus !== 'skipped') {
      return res.status(400).json({ success: false, message: 'Answer cannot be empty.' });
    }

    answer = await Answer.create({
      userId: req.user._id,
      interviewId,
      questionId,
      textAnswer: textAnswer || '',
      transcript: transcript || null,
      submissionStatus,
      evaluationStatus: 'pending',
    });

    res.status(201).json({ success: true, message: 'Answer submitted.', answer });

    // Evaluate in background
    if (effectiveAnswer.trim() && isAIConfigured()) {
      setImmediate(() => evaluateAnswerInBackground(answer._id, question, effectiveAnswer, interview));
    }
  } catch (error) {
    next(error);
  }
};

const evaluateAnswerInBackground = async (answerId, question, effectiveAnswer, interview) => {
  try {
    await Answer.findByIdAndUpdate(answerId, { evaluationStatus: 'evaluating' });

    const evaluation = await evaluateInterviewAnswer({
      questionText: question.questionText,
      userAnswer: effectiveAnswer,
      interviewType: interview.interviewType,
      difficulty: question.difficulty,
      expectedConcepts: question.expectedConcepts,
    });

    await Answer.findByIdAndUpdate(answerId, {
      evaluation,
      evaluationStatus: 'completed',
      evaluatedAt: new Date(),
    });
  } catch (err) {
    console.error('Answer evaluation failed:', err.message);
    await Answer.findByIdAndUpdate(answerId, { evaluationStatus: 'failed' });
  }
};

// GET /api/interviews/:id/answers
const getAnswers = async (req, res, next) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
    if (!interview) return res.status(404).json({ success: false, message: 'Interview not found.' });

    const answers = await Answer.find({ interviewId: req.params.id, userId: req.user._id })
      .populate('questionId', 'questionText category difficulty order');

    res.json({ success: true, answers });
  } catch (error) {
    next(error);
  }
};

// GET /api/answers/:id
const getAnswer = async (req, res, next) => {
  try {
    const answer = await Answer.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('questionId');
    if (!answer) return res.status(404).json({ success: false, message: 'Answer not found.' });
    res.json({ success: true, answer });
  } catch (error) {
    next(error);
  }
};

// POST /api/answers/:id/evaluate (manual trigger)
const triggerEvaluation = async (req, res, next) => {
  try {
    const answer = await Answer.findOne({ _id: req.params.id, userId: req.user._id });
    if (!answer) return res.status(404).json({ success: false, message: 'Answer not found.' });

    if (answer.evaluationStatus === 'completed') {
      return res.json({ success: true, message: 'Already evaluated.', evaluation: answer.evaluation });
    }

    if (!isAIConfigured()) {
      return res.status(503).json({ success: false, message: 'AI provider not configured.' });
    }

    const question = await Question.findById(answer.questionId);
    const interview = await Interview.findById(answer.interviewId);

    res.json({ success: true, message: 'Evaluation started.' });

    const effectiveAnswer = answer.textAnswer || answer.transcript || '';
    setImmediate(() => evaluateAnswerInBackground(answer._id, question, effectiveAnswer, interview));
  } catch (error) {
    next(error);
  }
};

// GET /api/answers/:id/evaluation
const getEvaluation = async (req, res, next) => {
  try {
    const answer = await Answer.findOne({ _id: req.params.id, userId: req.user._id })
      .select('evaluationStatus evaluation evaluatedAt');
    if (!answer) return res.status(404).json({ success: false, message: 'Answer not found.' });
    res.json({ success: true, evaluationStatus: answer.evaluationStatus, evaluation: answer.evaluation, evaluatedAt: answer.evaluatedAt });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitAnswer, getAnswers, getAnswer, triggerEvaluation, getEvaluation };
