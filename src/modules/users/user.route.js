import { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { updateUserSchema, getUsersSchema, useridSchema } from "./user.validation.js";
import {
  updateMe,
  getAllUsers,
  unblockUser,
  blockUser,
} from "./user.controller.js";

const router = Router();

router.patch("/me", authMiddleware, validate(updateUserSchema), updateMe);

router.get(
  "/",
  authMiddleware,
  authorize("admin"),
  validate(getUsersSchema),
  getAllUsers,
);

router.patch(
  "/:userid/block",
  authMiddleware,
  authorize("admin"),
  validate(getUsersSchema),
  blockUser,
);
router.patch(
  "/:userid/unblock",
  authMiddleware,
  authorize("admin"),
  validate(useridSchema),
  unblockUser,
);

export default router;
