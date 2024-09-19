const CustomError = require('../Utils/customError')

module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  if (error.code === 11000) {
    error = handleDuplicateError(error);
  };
  if (error.name === 'ValidationError') {
    error = handleValidationError(error);
  }
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stackTrace: error.stack,
    error: error
  })

  next()
}

const handleDuplicateError = (error) => {
  return new CustomError("User already exists with this Email", 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  return new CustomError(`Invalid Input Data. ${errors.join('. ')}`, 400);
}