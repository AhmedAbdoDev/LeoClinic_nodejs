import express from "express";
import * as authController from "./auth.controller.js";
const router = express.Router();

router.get("/register", authController.register);
router.get("/login", authController.login);

export default router;
