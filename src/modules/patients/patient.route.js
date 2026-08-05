import { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../middlewares/auth.middleware.js";
import { updatePatientSchema } from "./patient.validation.js";
import { updateMyPatientInfo } from "./patient.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";

const router = Router();

router.patch(
  "/me",
  authMiddleware,
  authorize("patient"),
  validate(updatePatientSchema),
  updateMyPatientInfo,
);

export default router;
