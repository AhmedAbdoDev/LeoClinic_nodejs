import { Router } from 'express';
import { authMiddleware, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { updatePatientSchema } from './patient.validation.js';
import { updateMyPatientInfo } from './patient.controller.js';

const router = Router();

router.patch(
  '/me',
  authMiddleware,
  authorize('patient'),
  validate(updatePatientSchema),
  updateMyPatientInfo
);

export default router;
