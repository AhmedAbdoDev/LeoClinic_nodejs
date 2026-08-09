import Payment from "../../models/payment.model.js";
import Appointment from "../../models/appointment.model.js";
import Notification from "../../models/notification.model.js";
import AppError from "../../error/AppError.js";

const buildEventKey = (entity, entityId, action, recipientRole) => {
  return `${entity}:${entityId}:${action}:${recipientRole}`;
};

const createNotification = async ({
  userId,
  appointmentId,
  recipientRole,
  type,
  title,
  message,
  data = {},
}) => {
  try {
    const eventKey = buildEventKey(
      "payment",
      appointmentId,
      "paid",
      recipientRole,
    );
    await Notification.create({
      user_id: userId,
      appointment_id: appointmentId,
      event_key: eventKey,
      recipient_role: recipientRole,
      type,
      title,
      message,
      data,
    });
  } catch (error) {
    console.error("Failed to create notification:", error.message);
  }
};

export const simulatePayment = async (appointmentId, patientId, method) => {
  const appointment = await Appointment.findById(appointmentId)
    .populate("patient_id", "name email")
    .populate("doctor_id", "name email");

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  if (appointment.patient_id._id.toString() !== patientId.toString()) {
    throw new AppError("You can only pay for your own appointments", 403);
  }

  if (appointment.status !== "pending") {
    throw new AppError("Only pending appointments can be paid", 400);
  }

  const existingPayment = await Payment.findOne({
    appointment_id: appointmentId,
  });
  if (existingPayment && existingPayment.status === "paid") {
    throw new AppError("This appointment has already been paid", 400);
  }

  const payment = await Payment.create({
    appointment_id: appointment._id,
    patient_id: appointment.patient_id._id,
    doctor_id: appointment.doctor_id._id,
    amount: 0,
    method,
    status: "paid",
    paid_at: new Date(),
  });

  await createNotification({
    userId: appointment.patient_id._id,
    appointmentId: appointment._id,
    recipientRole: "patient",
    type: "payment_success",
    title: "Payment Successful",
    message: "Your payment was successful.",
    data: { paymentId: payment._id, method },
  });

  await createNotification({
    userId: appointment.doctor_id._id,
    appointmentId: appointment._id,
    recipientRole: "doctor",
    type: "payment_received",
    title: "Payment Received",
    message: `Patient ${appointment.patient_id.name} has paid for the appointment.`,
    data: { paymentId: payment._id, patientName: appointment.patient_id.name },
  });

  return payment;
};

export const getPaymentByAppointment = async (appointmentId) => {
  const payment = await Payment.findOne({ appointment_id: appointmentId });
  if (!payment) {
    throw new AppError("Payment not found for this appointment", 404);
  }
  return payment;
};

export const getPatientPayments = async (patientId) => {
  return Payment.find({ patient_id: patientId }).sort({ createdAt: -1 });
};
