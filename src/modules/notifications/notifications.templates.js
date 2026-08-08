import { NotificationTypes } from "./notifications.constants.js";

const templates = {
  [NotificationTypes.NEW_APPOINTMENT]: (payload) => ({
    title: "New Appointment",
    message: `${payload.patientName} booked a new appointment.`,
  }),
  [NotificationTypes.APPOINTMENT_CREATED]: (payload) => ({
    title: "Appointment Created",
    message: `Your appointment with Dr. ${payload.doctorName} has been created.`,
  }),
  [NotificationTypes.APPOINTMENT_CONFIRMED]: (payload) => ({
    title: "Appointment Confirmed",
    message: `Dr. ${payload.doctorName} confirmed your appointment.`,
  }),
  [NotificationTypes.APPOINTMENT_COMPLETED]: (payload) => ({
    title: "Appointment Completed",
    message: `Dr. ${payload.doctorName} Completed your appointment.`,
  }),
  [NotificationTypes.APPOINTMENT_CANCELLED]: (payload) => ({
    title: "Appointment Cancelled",
    message: `Your appointment has been cancelled.`,
  }),
  [NotificationTypes.PAYMENT_COMPLETED]: (payload) => ({
    title: "Payment Successful",
    message: "Your payment has been completed successfully.",
  }),
  [NotificationTypes.REMINDER]: (payload) => ({
    title: "Appointment Reminder",
    message: `You have an appointment soon with Dr. ${payload.doctorName}.`,
  }),
};

export function buildNotification(type, payload = {}) {
  return (
    templates[type]?.(payload) ?? {
      title: "Notification",
      message: "You have a new notification.",
    }
  );
}
