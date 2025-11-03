// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error("Error:", err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = {
      message,
      statusCode: 404,
      success: false,
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${
      field.charAt(0).toUpperCase() + field.slice(1)
    } already exists`;
    error = {
      message,
      statusCode: 400,
      success: false,
    };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = {
      message,
      statusCode: 400,
      success: false,
    };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token. Please log in again.";
    error = {
      message,
      statusCode: 401,
      success: false,
    };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired. Please log in again.";
    error = {
      message,
      statusCode: 401,
      success: false,
    };
  }

  // Express validator errors
  if (err.array && typeof err.array === "function") {
    const message = err
      .array()
      .map((error) => error.msg)
      .join(", ");
    error = {
      message,
      statusCode: 400,
      success: false,
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      error: err,
    }),
  });
};
