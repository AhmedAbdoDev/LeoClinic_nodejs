import Notification from "../../models/notification.model.js";
import NotificationJob from "../../models/notificationJob.model.js";
import User from "../../models/user.model.js";
import { buildNotification } from "./notifications.templates.js";

async function createEmailJob({
  notificationId,
  eventKey,
  userId,
  type,
  payload,
}) {
  const existsJob = await NotificationJob.exists({
    event_key: eventKey,
  });

  if (existsJob) {
    return;
  }

  const user = await User.findById(userId).select("email");

  if (!user) {
    return;
  }

  await NotificationJob.create({
    notification_id: notificationId,
    event_key: eventKey,
    recipient: user.email,
    channel: "email",
    type,
    payload,
  });
}

export async function createNotification({
  userId,
  appointmentId = null,
  recipientRole,
  type,
  payload = {},
  channels = ["database"],
  eventKey,
  entity,
  entityId,
  action,
}) {
  const finalEventKey =
    eventKey ??
    buildEventKey({
      entity,
      entityId: entityId ?? appointmentId,
      action,
      recipient: recipientRole,
    });
  const exists = await Notification.findOne({
    event_key: finalEventKey,
  });
  if (exists) {
    if (channels.includes("email")) {
      await createEmailJob({
        notificationId: exists._id,
        eventKey: finalEventKey,
        userId,
        type,
        payload,
      });
    }

    return exists;
  }
  const template = buildNotification(type, payload);

  let notification;
  try {
    notification = await Notification.create({
      user_id: userId,
      appointment_id: appointmentId,
      recipient_role: recipientRole,
      event_key: finalEventKey,
      type,
      title: template.title,
      message: template.message,
      data: payload,
    });
  } catch (err) {
    if (err.code === 11000) {
      notification = await Notification.findOne({
        event_key: finalEventKey,
      });
      if (!notification) throw err;
    } else throw err;
  }

  if (channels.includes("email")) {
    await createEmailJob({
      notificationId: notification._id,
      eventKey: finalEventKey,
      userId,
      type,
      payload,
    });
  }

  return notification;
}

export function buildEventKey({ entity, entityId, action, recipient }) {
  if (!entity) throw new Error("entity is required");
  if (!entityId) throw new Error("entityId is required");
  if (!action) throw new Error("action is required");
  if (!recipient) throw new Error("recipient is required");

  return `${entity}:${entityId}:${action}:${recipient}`;
}
