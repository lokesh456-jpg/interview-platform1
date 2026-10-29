const User = require('../models/User');

const FREE_PLAN_LIMITS = {
  interviews: 10,
  resumeAnalyses: 3,
};

const PRO_PLAN_LIMITS = {
  interviews: Infinity,
  resumeAnalyses: Infinity,
};

const getLimits = (plan) => plan === 'pro' ? PRO_PLAN_LIMITS : FREE_PLAN_LIMITS;

const checkInterviewQuota = async (userId) => {
  const user = await User.findById(userId).select('plan interviewUsageCount');
  if (!user) throw new Error('User not found.');
  const limits = getLimits(user.plan);
  if (user.interviewUsageCount >= limits.interviews) {
    return {
      allowed: false,
      message: `You have reached the ${user.plan === 'free' ? 'free plan' : ''} limit of ${limits.interviews} interviews. Please upgrade to Pro for unlimited interviews.`,
      limit: limits.interviews,
      used: user.interviewUsageCount,
    };
  }
  return { allowed: true, limit: limits.interviews, used: user.interviewUsageCount };
};

const checkResumeQuota = async (userId) => {
  const user = await User.findById(userId).select('plan resumeAnalysisCount');
  if (!user) throw new Error('User not found.');
  const limits = getLimits(user.plan);
  if (user.resumeAnalysisCount >= limits.resumeAnalyses) {
    return {
      allowed: false,
      message: `You have reached the limit of ${limits.resumeAnalyses} resume analyses on the free plan. Please upgrade to Pro.`,
      limit: limits.resumeAnalyses,
      used: user.resumeAnalysisCount,
    };
  }
  return { allowed: true, limit: limits.resumeAnalyses, used: user.resumeAnalysisCount };
};

const incrementInterviewCount = async (userId) => {
  await User.findByIdAndUpdate(userId, { $inc: { interviewUsageCount: 1 } });
};

const incrementResumeCount = async (userId) => {
  await User.findByIdAndUpdate(userId, { $inc: { resumeAnalysisCount: 1 } });
};

const getUsage = async (userId) => {
  const user = await User.findById(userId).select('plan interviewUsageCount resumeAnalysisCount');
  const limits = getLimits(user.plan);
  return {
    plan: user.plan,
    interviews: { used: user.interviewUsageCount, limit: limits.interviews === Infinity ? null : limits.interviews },
    resumeAnalyses: { used: user.resumeAnalysisCount, limit: limits.resumeAnalyses === Infinity ? null : limits.resumeAnalyses },
  };
};

module.exports = { checkInterviewQuota, checkResumeQuota, incrementInterviewCount, incrementResumeCount, getUsage };
