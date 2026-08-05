import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { updateMe } from './user.controller.js';

const router = Router();

router.patch('/me', authMiddleware, updateMe);

export default router;