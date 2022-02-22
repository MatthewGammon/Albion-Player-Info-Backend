function errorHandler(err, req, res, next) {
  const { status = 500, message = 'Something went wrong!' } = error;
  res.status(status).json({ err: message });
}

module.exports = errorHandler;
