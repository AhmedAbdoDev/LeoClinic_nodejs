export const NotificationTypes = {
  NEW_APPOINTMENT: "new_appointment",
  APPOINTMENT_CREATED: "appointment_created",
  APPOINTMENT_CONFIRMED: "appointment_confirmed",
  APPOINTMENT_CANCELLED: "appointment_cancelled",
  APPOINTMENT_COMPLETED: "appointment_completed",
  PAYMENT_PENDING: "payment_pending",
  PAYMENT_COMPLETED: "payment_completed",
  PAYMENT_RECEIVED: "payment_received",
  PAYMENT_FAILED: "payment_failed",
  REMINDER: "reminder",
  DOCTOR_APPROVED: "doctor_approved",
  DOCTOR_REJECTED: "doctor_rejected",
  RATING_CREATED: "rating_created",
  RATING_RESPONDED: "rating_responded",
};

export const NotificationEntities = {
  APPOINTMENT: "appointment",
  PAYMENT: "payment",
  DOCTOR: "doctor",
  PATIENT: "patient",
  RATING: "rating",
};

export const NotificationRecipients = {
  DOCTOR: "doctor",
  PATIENT: "patient",
  ADMIN: "admin",
};

export const NotificationActions = {
  CREATED: "created",
  NEW: "new",
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  PAID: "paid",
  FAILED: "failed",
  APPROVED: "approved",
  REJECTED: "rejected",
  REMINDER: "reminder",
  RESPONDED: "responded",
};
