import { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  bookAppointmentSchema,
  updateAppointmentStatusSchema,
  getAppointmentsSchema,
} from "./appointment.validation.js";
import {
  bookAppointmentHandler,
  updateAppointmentStatusHandler,
  getAppointmentsHandler,
} from "./appointment.controller.js";

const router = Router();
router.post(
  "/",
  authMiddleware,
  authorize("patient"),
  validate(bookAppointmentSchema),
  bookAppointmentHandler,
);
router.patch(
  "/:id",
  authMiddleware,
  authorize("patient", "doctor"),
  validate(updateAppointmentStatusSchema),
  updateAppointmentStatusHandler,
);
router.get(
  "/",
  authMiddleware,
  authorize("patient", "doctor"),
  validate(getAppointmentsSchema),
  getAppointmentsHandler,
);

export default router;
