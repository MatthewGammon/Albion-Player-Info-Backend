function errorHandler(err, req, res, next) {
  const { status = 500, message = 'Something went wrong!' } = err;
  res.status(status).json({ err: message });
}

module.exports = errorHandler;
