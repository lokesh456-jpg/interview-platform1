const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authenticate } = require('../middleware/authenticate');
const { validateRequest } = require('../middleware/validateRequest');
const { aiLimiter } = require('../middleware/rateLimiter');
const {
  createInterview, getInterviews, getInterview, startInterview, nextQuestion,
  completeInterview, cancelInterview, deleteInterview, retryInterview
} = require('../controllers/interviewController');
const { submitAnswer, getAnswers } = require('../controllers/answerController');
const { getInterviewReport } = require('../controllers/reportController');

router.use(authenticate);

router.post('/', [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('jobRole').trim().notEmpty().withMessage('Job role required'),
  body('interviewType').isIn(['technical', 'behavioral', 'hr', 'coding', 'system_design', 'mixed']).withMessage('Invalid interview type'),
  body('questionCount').isIn([5, 10, 15, 20]).withMessage('Question count must be 5, 10, 15, or 20'),
  body('durationLimit').isIn([15, 30, 45, 60]).withMessage('Duration must be 15, 30, 45, or 60 minutes'),
], validateRequest, createInterview);

router.get('/', getInterviews);
router.get('/:id', getInterview);
router.post('/:id/start', aiLimiter, startInterview);
router.post('/:id/next-question', nextQuestion);
router.post('/:id/complete', completeInterview);
router.post('/:id/cancel', cancelInterview);
router.post('/:id/retry', retryInterview);
router.delete('/:id', deleteInterview);

// Nested answer routes
router.post('/:id/answers', [
  body('questionId').notEmpty().withMessage('Question ID required'),
], validateRequest, submitAnswer);
router.get('/:id/answers', getAnswers);

// Nested report route
router.get('/:id/report', getInterviewReport);

module.exports = router;
