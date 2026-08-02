import Session from "../models/session.model.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer "))
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });

    const token = authHeader.split(" ")[1];

    const decoded = verifyAccessToken(token);

    const session = await Session.findById(decoded.sessionId).populate(
      "user_id",
    );
    if (
      !session ||
      session.revoked_at ||
      session.expires_at <= new Date() ||
      !session.user_id ||
      session.user_id.is_blocked ||
      !session.user_id.is_verified ||
      session.user_id._id.toString() !== decoded.userId
    )
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token",
      });

    req.auth = decoded;
    req.user = session.user_id;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    next();
  };
};
