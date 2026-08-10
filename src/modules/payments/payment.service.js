import Payment from "../../models/payment.model.js";
import Appointment from "../../models/appointment.model.js";
import User from "../../models/user.model.js";
import AppError from "../../error/AppError.js";
import {
  NotificationActions,
  NotificationEntities,
  NotificationRecipients,
  NotificationTypes,
} from "../notifications/notifications.constants.js";
import { createNotification } from "../notifications/notifications.helper.js";

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

  const doctor = await User.findById(appointment.doctor_id._id);
  if (!doctor) {
    throw new AppError("Doctor not found", 404);
  }

  const amount = doctor.doctorProfile?.price || 0;

  const payment = await Payment.create({
    appointment_id: appointment._id,
    patient_id: appointment.patient_id._id,
    doctor_id: appointment.doctor_id._id,
    amount,
    method,
    status: "paid",
    paid_at: new Date(),
  });


  await createNotification({
    userId: appointment.patient_id._id,
    appointmentId: appointment._id,
    recipientRole: NotificationRecipients.PATIENT,
    type: NotificationTypes.PAYMENT_COMPLETED,
    entity: NotificationEntities.PAYMENT,
    entityId: payment._id,
    action: NotificationActions.PAID,
    payload: {
      paymentId: payment._id,
      method,
      amount,
    },
  });

  await createNotification({
    userId: appointment.doctor_id._id,
    appointmentId: appointment._id,
    recipientRole: NotificationRecipients.DOCTOR,
    type: NotificationTypes.PAYMENT_RECEIVED,
    entity: NotificationEntities.PAYMENT,
    entityId: payment._id,
    action: NotificationActions.PAID,
    payload: {
      paymentId: payment._id,
      patientName: appointment.patient_id.name,
      amount,
    },
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

export const getPaymentRecords = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.patientId) query.patient_id = filters.patientId;
  if (filters.doctorId) query.doctor_id = filters.doctorId;

  const payments = await Payment.find(query)
    .populate("patient_id", "name email")
    .populate("doctor_id", "name email")
    .populate("appointment_id")
    .sort({ createdAt: -1 });

  return payments;
};

export const getRevenueReport = async (filters = {}) => {
  const query = { status: "paid" };
  if (filters.startDate) query.paid_at = { $gte: new Date(filters.startDate) };
  if (filters.endDate) {
    query.paid_at = { ...query.paid_at, $lte: new Date(filters.endDate) };
  }

  const payments = await Payment.find(query);
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  return {
    totalRevenue,
    totalPayments: payments.length,
    payments,
  };
};