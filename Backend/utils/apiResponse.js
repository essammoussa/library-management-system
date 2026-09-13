/**
 * Standardized API response helper
 */

exports.success = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

exports.error = (res, message = 'An error occurred', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

exports.notFound = (res, message = 'Resource not found') => {
  return res.status(404).json({
    success: false,
    message,
  });
};

exports.validationError = (res, message) => {
  return res.status(400).json({
    success: false,
    message,
  });
};
