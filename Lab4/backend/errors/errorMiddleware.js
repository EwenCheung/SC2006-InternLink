export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  // Use error's status code or default to 500
  let statusCode = err.statusCode || 500;
  let message = err.message;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    // If it's an email duplicate
    if (err.keyPattern?.email) {
      message = 'Email already exists';
    }
  }

  // Handle authentication errors
  if (err.name === 'UnauthorizedError' || err.message.includes('authentication')) {
    statusCode = 401;
    message = 'Authentication failed';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expired, please login again';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};
