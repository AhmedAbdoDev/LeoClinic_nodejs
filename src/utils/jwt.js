import jwt from "jsonwebtoken";
import crypto from "crypto";
import { TOKEN_EXPIRATION } from "../modules/auth/auth.constants.js";
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const generateSecurityToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = hashToken(rawToken);

  return { rawToken, hashedToken };
};

export const setRefreshCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth/refresh",
    priority: "high",
    maxAge: TOKEN_EXPIRATION.refresh_token,
  });
};

export const clearRefreshCookie = (res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth/refresh",
  });
};
