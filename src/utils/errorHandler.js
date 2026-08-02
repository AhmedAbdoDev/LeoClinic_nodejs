import AppError from "../error/AppError.js";

export default function errorHandler(err, req, res, next) {
  if (err instanceof AppError)
    return res.status(err.status).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  console.error("Unexpected error:", err);
  try {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  } catch (responseError) {
    console.error("Error sending error response:", responseError);
  }
}
