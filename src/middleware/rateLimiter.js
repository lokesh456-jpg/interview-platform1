const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
    skip: () => process.env.NODE_ENV === 'test',
  });

const authLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  20,
  'Too many authentication attempts. Please wait 15 minutes before trying again.'
);

const apiLimiter = createLimiter(
  60 * 1000, // 1 minute
  100,
  'Too many requests. Please slow down.'
);

const aiLimiter = createLimiter(
  60 * 1000, // 1 minute
  10,
  'Too many AI requests. Please wait before generating more content.'
);

const uploadLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  10,
  'Too many uploads. Please wait before uploading again.'
);

module.exports = { authLimiter, apiLimiter, aiLimiter, uploadLimiter };
