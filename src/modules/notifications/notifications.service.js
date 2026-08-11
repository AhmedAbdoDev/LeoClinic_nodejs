import Notification from "../../models/notification.model.js";
import AppError from "../../error/AppError.js";

export async function getMyNotifications({ userId }) {
  return Notification.find({
    user_id: userId,
  }).sort({ createdAt: -1 });
}

export async function markNotificationAsRead({ id, userId }) {
  const notification = await Notification.findOne({
    _id: id,
    user_id: userId,
  });
  if (!notification) throw new AppError("Notification not found", 404);
  if (!notification.is_read) {
    notification.is_read = true;
    await notification.save();
  }

  return notification;
}

export async function markAllNotificationsAsRead({ userId }) {
  const result = await Notification.updateMany(
    { user_id: userId, is_read: false },
    { $set: { is_read: true } },
  );

  return {
    modifiedCount: result.modifiedCount,
  };
}

export async function getUnreadCount({ userId }) {
  return Notification.countDocuments({
    user_id: userId,
    is_read: false,
  });
}
