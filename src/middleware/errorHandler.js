const errorHandler = (err, req, res, next) => {
  // Log error (without sensitive data)
  console.error(`[Error] ${req.method} ${req.path}:`, {
    message: err.message,
    status: err.status || err.statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `${field === 'email' ? 'An account with this email already exists.' : 'Duplicate entry detected.'}`,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid resource identifier.' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired.' });
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File is too large. Maximum size is 10MB.' });
  }

  // Default
  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : 'An unexpected error occurred. Please try again.';

  res.status(status).json({ success: false, message });
};

module.exports = { errorHandler };
