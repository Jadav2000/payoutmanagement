const errorHandler = (err, _req, res, _next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    message,
    details: err.details || undefined,
  });
};

module.exports = errorHandler;
