import {
  simulatePayment,
  getPaymentByAppointment,
  getPatientPayments,
  getRevenueReport,
  getPaymentRecords,
} from "./payment.service.js";

export const simulatePaymentHandler = async (req, res, next) => {
  const { appointmentId, method } = req.body;
  const patientId = req.user._id;

  const payment = await simulatePayment(appointmentId, patientId, method);
  res.status(201).json({
    success: true,
    message: "Payment simulated successfully",
    data: payment,
  });
};

export const getPaymentByAppointmentHandler = async (req, res, next) => {
  const { id } = req.params;
  const payment = await getPaymentByAppointment(id);
  res.status(200).json({
    success: true,
    data: payment,
  });
};

export const getPatientPaymentsHandler = async (req, res, next) => {
  const patientId = req.user._id;
  const payments = await getPatientPayments(patientId);
  res.status(200).json({
    success: true,
    data: payments,
  });
};

export const getPaymentRecordsHandler = async (req, res) => {
  const filters = req.query;

  const result = await getPaymentRecords(filters);

  return res.status(200).json({
    success: true,
    data: result,
  });
};

export const getRevenueReportHandler = async (req, res) => {
  const filters = req.query;

  const result = await getRevenueReport(filters);

  return res.status(200).json({
    success: true,
    data: result,
  });
};
