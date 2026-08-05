import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { updateMyPatientInfo } from './patient.controller.js';

const router = Router();

router.patch('/me', authMiddleware, updateMyPatientInfo);

export default router;