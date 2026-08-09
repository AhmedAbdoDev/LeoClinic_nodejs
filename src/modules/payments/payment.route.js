import { Router } from 'express';
import { authMiddleware, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { simulatePaymentSchema } from './payment.validation.js';
import {
  simulatePaymentHandler,
  getPaymentByAppointmentHandler,
  getPatientPaymentsHandler,
} from './payment.controller.js';

const router = Router();

router.post(
  '/simulate',
  authMiddleware,
  authorize('patient'),
  validate(simulatePaymentSchema),
  simulatePaymentHandler
);

router.get(
  '/appointment/:id',
  authMiddleware,
  authorize('patient', 'doctor', 'admin'),
  getPaymentByAppointmentHandler
);

router.get(
  '/me',
  authMiddleware,
  authorize('patient'),
  getPatientPaymentsHandler
);

export default router;