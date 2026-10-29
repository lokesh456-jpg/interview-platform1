const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const { getAnswer, triggerEvaluation, getEvaluation } = require('../controllers/answerController');

router.use(authenticate);
router.get('/:id', getAnswer);
router.post('/:id/evaluate', triggerEvaluation);
router.get('/:id/evaluation', getEvaluation);

module.exports = router;
