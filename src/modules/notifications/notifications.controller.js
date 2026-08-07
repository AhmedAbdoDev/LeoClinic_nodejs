import * as notificationService from "./notifications.service.js";

export async function getMyNotifications(req, res) {
  const notifications = await notificationService.getMyNotifications({
    userId: req.user._id,
  });

  return res.status(200).json({
    success: true,
    data: notifications,
  });
}

export async function markNotificationAsRead(req, res) {
  const notification = await notificationService.markNotificationAsRead({
    id: req.params.id,
    userId: req.user._id,
  });

  return res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: notification,
  });
}

export async function markAllNotificationsAsRead(req, res) {
  const result = await notificationService.markAllNotificationsAsRead({
    userId: req.user._id,
  });

  return res.status(200).json({
    success: true,
    message: "All notifications marked as read",
    data: result,
  });
}

export async function getUnreadCount(req, res) {
  const count = await notificationService.getUnreadCount({
    userId: req.user._id,
  });

  return res.status(200).json({
    success: true,
    data: {
      unread: count,
    },
  });
}
