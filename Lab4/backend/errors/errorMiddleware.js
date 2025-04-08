export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  // Use error's status code or default to 500
  let statusCode = err.statusCode || 500;
  let message = err.message;

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON format';
  }

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

  // Handle file upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File is too large';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file type';
        break;
      default:
        message = 'File upload error';
    }
  }

  // If file upload error comes from our fileFilter
  if (err.message.includes('format allowed')) {
    statusCode = 400;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};
