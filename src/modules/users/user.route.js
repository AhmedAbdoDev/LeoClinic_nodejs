import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validation.middleware.js';
import { updateUserSchema } from './user.validation.js';
import { updateMe } from './user.controller.js';

const router = Router();

router.patch('/me', authMiddleware, validate(updateUserSchema), updateMe);

export default router;
