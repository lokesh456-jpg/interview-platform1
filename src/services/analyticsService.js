const Interview = require('../models/Interview');
const Answer = require('../models/Answer');
const Report = require('../models/Report');

/**
 * Analytics service - all calculations from real DB data
 */

const getOverview = async (userId) => {
  const completedInterviews = await Interview.find({
    userId,
    status: 'completed',
  }).select('overallScore totalDuration createdAt completedAt').lean();

  const totalInterviews = completedInterviews.length;

  const scoresArray = completedInterviews
    .map(i => i.overallScore)
    .filter(s => s !== null && s !== undefined);

  const avgScore = scoresArray.length > 0
    ? Math.round(scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length)
    : null;

  const bestScore = scoresArray.length > 0 ? Math.max(...scoresArray) : null;

  // Total practice time in seconds
  const totalSeconds = completedInterviews.reduce((sum, i) => sum + (i.totalDuration || 0), 0);
  const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;

  // Monthly comparison for "this month"
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const thisMonthCount = completedInterviews.filter(i => new Date(i.createdAt) >= startOfMonth).length;
  const lastMonthCount = completedInterviews.filter(i => {
    const d = new Date(i.createdAt);
    return d >= lastMonthStart && d < startOfMonth;
  }).length;

  // Skill improvement: compare last 3 scores vs 3 before that
  let skillImprovement = null;
  if (scoresArray.length >= 4) {
    const recent = scoresArray.slice(-3);
    const earlier = scoresArray.slice(-6, -3);
    if (earlier.length > 0) {
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
      skillImprovement = Math.round(recentAvg - earlierAvg);
    }
  }

  return {
    totalInterviews,
    avgScore,
    bestScore,
    totalHours,
    thisMonthCount,
    lastMonthCount,
    skillImprovement,
    hasEnoughData: totalInterviews >= 4,
  };
};

const getScoreTrends = async (userId, period = '6months') => {
  const now = new Date();
  let startDate;
  let groupBy;

  switch (period) {
    case '1month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } };
      break;
    case '3months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      groupBy = { $dateToString: { format: '%Y-%W', date: '$completedAt' } };
      break;
    case '6months':
    default:
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      groupBy = { $dateToString: { format: '%Y-%m', date: '$completedAt' } };
  }

  const trends = await Interview.aggregate([
    {
      $match: {
        userId,
        status: 'completed',
        completedAt: { $gte: startDate },
        overallScore: { $ne: null },
      },
    },
    {
      $group: {
        _id: groupBy,
        avgScore: { $avg: '$overallScore' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        period: '$_id',
        avgScore: { $round: ['$avgScore', 0] },
        count: 1,
        _id: 0,
      },
    },
  ]);

  return trends;
};

const getSkillBreakdown = async (userId) => {
  const reports = await Report.find({
    userId,
    reportStatus: 'completed',
  }).select('skillScores overallScore createdAt').lean();

  if (reports.length === 0) {
    return { hasData: false, skillScores: null };
  }

  const avg = (arr) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;

  const techScores = reports.map(r => r.skillScores?.technicalKnowledge).filter(Boolean);
  const problemScores = reports.map(r => r.skillScores?.problemSolving).filter(Boolean);
  const commScores = reports.map(r => r.skillScores?.communication).filter(Boolean);
  const confScores = reports.map(r => r.skillScores?.confidence).filter(Boolean);
  const overallScores = reports.map(r => r.overallScore).filter(s => s !== null);

  return {
    hasData: true,
    skillScores: {
      technicalKnowledge: avg(techScores),
      problemSolving: avg(problemScores),
      communication: avg(commScores),
      confidence: avg(confScores),
      overall: avg(overallScores),
    },
    reportCount: reports.length,
  };
};

const getCategoryPerformance = async (userId) => {
  const data = await Interview.aggregate([
    {
      $match: {
        userId,
        status: 'completed',
        overallScore: { $ne: null },
      },
    },
    {
      $group: {
        _id: '$interviewType',
        avgScore: { $avg: '$overallScore' },
        count: { $sum: 1 },
        bestScore: { $max: '$overallScore' },
      },
    },
    {
      $project: {
        category: '$_id',
        avgScore: { $round: ['$avgScore', 0] },
        count: 1,
        bestScore: 1,
        _id: 0,
      },
    },
  ]);

  return data;
};

const getMonthlyActivity = async (userId) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const data = await Interview.aggregate([
    {
      $match: {
        userId,
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { month: '$_id', count: 1, completed: 1, _id: 0 } },
  ]);

  return data;
};

module.exports = { getOverview, getScoreTrends, getSkillBreakdown, getCategoryPerformance, getMonthlyActivity };
