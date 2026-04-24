const { validationResult } = require("express-validator");

const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const error = new Error("Validation failed.");
  error.statusCode = 400;
  error.details = errors.array().map((e) => ({
    field: e.path,
    message: e.msg,
  }));
  return next(error);
};

module.exports = validate;
