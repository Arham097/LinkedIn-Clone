module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";
  res.status(statusCode).json({
    status: error.status,
    message: error.message,
    stackTrace: error.stack,
    error: error
  })
}