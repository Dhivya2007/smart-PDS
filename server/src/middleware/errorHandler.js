export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose duplicate key error (e.g. index violation)
  if (err.code === 11000) {
    statusCode = 409;
    const fields = Object.keys(err.keyValue || {});
    if (fields.includes('rationCardId') && fields.includes('monthCycle')) {
      message = 'An active booking or distribution record already exists for this ration card in this monthly cycle.';
    } else if (fields.includes('cardNumber')) {
      message = 'A ration card with this number already exists.';
    } else if (fields.includes('email')) {
      message = 'An account with this email address already exists.';
    } else if (fields.includes('fpsCode')) {
      message = 'A Fair Price Shop with this code already exists.';
    } else {
      message = `Duplicate entry error on field(s): ${fields.join(', ')}`;
    }
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = `Validation Error: ${errors.join('; ')}`;
  }

  // Handle CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with id: ${err.value}`;
  }

  console.error(`[API Error] [${req.method} ${req.originalUrl}]:`, {
    status: statusCode,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};
