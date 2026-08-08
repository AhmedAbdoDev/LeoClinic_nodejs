import { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import {
  getDoctorScheduleSchema,
  appointmentIdParamSchema,
  completeAppointmentSchema,
} from "./appointment.validation.js";
import {
  getSchedule,
  confirm,
  cancel,
  complete,
} from "./appointment.controller.js";

const router = Router();

router.get(
  "/schedule",
  authMiddleware,
  authorize("doctor"),
  validate(getDoctorScheduleSchema),
  getSchedule,
);

router.patch(
  "/:appointmentId/confirm",
  authMiddleware,
  authorize("doctor"),
  validate(appointmentIdParamSchema),
  confirm,
);

router.patch(
  "/:appointmentId/complete",
  authMiddleware,
  authorize("doctor"),
  validate(completeAppointmentSchema),
  complete,
);

router.patch(
  "/:appointmentId/cancel",
  authMiddleware,
  authorize("doctor"),
  validate(appointmentIdParamSchema),
  cancel,
);

export default router;
