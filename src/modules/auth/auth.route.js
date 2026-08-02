import express from "express";
import * as authController from "./auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  refreshTokenSchema,
  registerSchema,
  verifyEmailSchema,
} from "./auth.validation.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);

router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  authController.verifyEmail,
);

router.post("/login", authController.login);

router.post("/logout", authMiddleware, authController.logout);

router.post(
  "/refresh",
  validate(refreshTokenSchema),
  authController.refreshToken,
);
export default router;
