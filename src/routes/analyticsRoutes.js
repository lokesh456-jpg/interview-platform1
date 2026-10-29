const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const { getOverview, getScoreTrends, getSkillBreakdown, getCategoryPerformance, getRecommendations, getMonthlyActivity } = require('../controllers/analyticsController');

router.use(authenticate);
router.get('/overview', getOverview);
router.get('/score-trends', getScoreTrends);
router.get('/skill-breakdown', getSkillBreakdown);
router.get('/category-performance', getCategoryPerformance);
router.get('/recommendations', getRecommendations);
router.get('/monthly-activity', getMonthlyActivity);

module.exports = router;
