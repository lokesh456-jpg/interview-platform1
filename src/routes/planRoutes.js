const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authenticate');
const { getUsage } = require('../services/quotaService');

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'forever',
    features: [
      '10 mock interviews',
      '3 resume analyses',
      'Basic feedback',
      'Interview history',
      'Text-based answers',
    ],
    limits: { interviews: 10, resumeAnalyses: 3 },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited interviews',
      'Unlimited resume analyses',
      'Advanced AI feedback',
      'Voice interviews',
      'Detailed analytics',
      'Priority support',
      'Data export',
    ],
    limits: { interviews: null, resumeAnalyses: null },
    paymentIntegration: 'unconfigured',
    paymentNote: 'Payment integration is not currently configured. This plan is shown for informational purposes.',
  },
];

router.get('/plans', (req, res) => {
  res.json({ success: true, plans: PLANS });
});

router.get('/usage', authenticate, async (req, res, next) => {
  try {
    const usage = await getUsage(req.user._id);
    res.json({ success: true, usage });
  } catch (error) {
    next(error);
  }
});

router.post('/usage/check', authenticate, async (req, res, next) => {
  try {
    const { feature } = req.body;
    const usage = await getUsage(req.user._id);
    let allowed = true;
    let message = 'Allowed';

    if (feature === 'interview') {
      const limit = usage.interviews.limit;
      if (limit !== null && usage.interviews.used >= limit) {
        allowed = false;
        message = `You've reached your interview limit (${limit}). Please upgrade to Pro.`;
      }
    } else if (feature === 'resumeAnalysis') {
      const limit = usage.resumeAnalyses.limit;
      if (limit !== null && usage.resumeAnalyses.used >= limit) {
        allowed = false;
        message = `You've reached your resume analysis limit (${limit}). Please upgrade to Pro.`;
      }
    }

    res.json({ success: true, allowed, message, usage });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
