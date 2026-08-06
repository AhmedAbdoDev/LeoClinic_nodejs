import { Router } from 'express';
import { authMiddleware, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { updateUserSchema, getUsersSchema } from './user.validation.js';
import { updateMe, getAllUsers } from './user.controller.js';

const router = Router();

console.log('✅ User routes loaded - PATCH /me is defined');

router.patch('/me', authMiddleware, validate(updateUserSchema), updateMe);

router.get(
  '/',
  authMiddleware,
  authorize('admin'),
  validate(getUsersSchema),
  getAllUsers
);

export default router;