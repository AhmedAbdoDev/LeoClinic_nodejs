import express from "express";
import * as authController from "./auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  forgotPasswordSchema,
  refreshTokenSchema,
  registerSchema,
  loginSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  verifyResetPasswordSchema,
} from "./auth.validation.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);

router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  authController.verifyEmail,
);

router.post("/login", validate(loginSchema), authController.login);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authController.requestPasswordReset,
);

router.get(
  "/password-reset/verify",
  validate(verifyResetPasswordSchema),
  authController.verifyPasswordResetToken,
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authController.submitNewPassword,
);

router.post("/logout", authMiddleware, authController.logout);

router.post(
  "/refresh",
  validate(refreshTokenSchema),
  authController.refreshToken,
);

router.post(
  "/resend-verification",
  validate(resendVerificationSchema),
  authController.resendVerification,
);
export default router;
