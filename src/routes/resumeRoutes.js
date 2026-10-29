const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const { upload } = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { uploadResume, getResumes, getResume, getResumeAnalysis, reanalyzeResume, activateResume, deleteResume } = require('../controllers/resumeController');

router.use(authenticate);

router.post('/upload', uploadLimiter, upload.single('resume'), uploadResume);
router.get('/', getResumes);
router.get('/:id', getResume);
router.get('/:id/analysis', getResumeAnalysis);
router.post('/:id/analyze', reanalyzeResume);
router.patch('/:id/activate', activateResume);
router.delete('/:id', deleteResume);

module.exports = router;
