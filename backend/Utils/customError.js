class customError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode,
      this.status = this.statusCode >= 400 && this.statusCode <= 500 ? 'failed' : 'error',
      this.isOperational = true;
    Error.captureStackTrace(this, this.contructor);
  }
}
module.exports = customError;