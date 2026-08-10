import { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { simulatePaymentSchema } from "./payment.validation.js";
import {
  simulatePaymentHandler,
  getPaymentByAppointmentHandler,
  getPatientPaymentsHandler,
  getPaymentRecordsHandler,
  getRevenueReportHandler,
} from "./payment.controller.js";

const router = Router();

router.post(
  "/simulate",
  authMiddleware,
  authorize("patient"),
  validate(simulatePaymentSchema),
  simulatePaymentHandler,
);

router.get(
  "/appointment/:id",
  authMiddleware,
  authorize("patient", "doctor", "admin"),
  getPaymentByAppointmentHandler,
);

router.get(
  "/me",
  authMiddleware,
  authorize("patient"),
  getPatientPaymentsHandler,
);


router.get(
  "/",
  authMiddleware,
  authorize("admin"),
  getPaymentRecordsHandler,
);

router.get(
  "/revenue",
  authMiddleware,
  authorize("admin"),
  getRevenueReportHandler,
);


export default router;
