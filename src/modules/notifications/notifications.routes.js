import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
} from "./notifications.controller.js";

import { validate } from "../../middlewares/validate.middleware.js";
import { notificationIdSchema } from "./notifications.validation.js";

const router = express.Router();

router.get("/", authMiddleware, getMyNotifications);

router.patch(
  "/:id/read",
  authMiddleware,
  validate(notificationIdSchema),
  markNotificationAsRead,
);

router.patch("/read-all", authMiddleware, markAllNotificationsAsRead);

router.get("/unread-count", authMiddleware, getUnreadCount);

export default router;
