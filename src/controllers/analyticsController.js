const analyticsService = require('../services/analyticsService');
const { generatePracticeRecommendations, getDefaultRecommendations } = require('../services/aiService');
const { isAIConfigured } = require('../config/aiProvider');
const Interview = require('../models/Interview');
const Answer = require('../models/Answer');

// GET /api/analytics/overview
const getOverview = async (req, res, next) => {
  try {
    const overview = await analyticsService.getOverview(req.user._id);
    res.json({ success: true, overview });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/score-trends
const getScoreTrends = async (req, res, next) => {
  try {
    const { period } = req.query;
    const trends = await analyticsService.getScoreTrends(req.user._id, period);
    res.json({ success: true, trends });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/skill-breakdown
const getSkillBreakdown = async (req, res, next) => {
  try {
    const breakdown = await analyticsService.getSkillBreakdown(req.user._id);
    res.json({ success: true, breakdown });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/category-performance
const getCategoryPerformance = async (req, res, next) => {
  try {
    const data = await analyticsService.getCategoryPerformance(req.user._id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/recommendations
const getRecommendations = async (req, res, next) => {
  try {
    const user = req.user;

    // Get user's recent performance data
    const recentInterviews = await Interview.find({
      userId: user._id,
      status: 'completed',
      overallScore: { $ne: null },
    }).sort({ completedAt: -1 }).limit(5).lean();

    const recentScores = recentInterviews.map(i => i.overallScore);
    const average = recentScores.length > 0
      ? Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length)
      : null;

    const weakSkills = user.skills?.filter(s => s.level < 65).map(s => s.name) || [];

    let recommendations;
    if (isAIConfigured() && recentInterviews.length > 0) {
      try {
        recommendations = await generatePracticeRecommendations({
          weakSkills,
          recentScores: { average, scores: recentScores },
          jobRole: user.preferredRoles?.[0] || 'Software Engineer',
          preferredCategories: user.preferredCategories,
        });
      } catch {
        recommendations = getDefaultRecommendations();
      }
    } else {
      recommendations = getDefaultRecommendations();
    }

    res.json({ success: true, recommendations, isPersonalized: isAIConfigured() && recentInterviews.length > 0 });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/monthly-activity
const getMonthlyActivity = async (req, res, next) => {
  try {
    const data = await analyticsService.getMonthlyActivity(req.user._id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { getOverview, getScoreTrends, getSkillBreakdown, getCategoryPerformance, getRecommendations, getMonthlyActivity };
