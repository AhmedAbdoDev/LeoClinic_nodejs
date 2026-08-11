import {
  bookAppointment,
  updateAppointmentStatus,
  getAppointments,
} from "./appointment.service.js";

export const bookAppointmentHandler = async (req, res, next) => {
  const { availabilityId, slotId, appointmentDate } = req.body;
  const patientId = req.user._id;

  const appointment = await bookAppointment(
    patientId,
    availabilityId,
    slotId,
    appointmentDate,
  );
  res.status(201).json({
    success: true,
    message: "Appointment booked successfully",
    data: appointment,
  });
};

export const updateAppointmentStatusHandler = async (req, res, next) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const userId = req.user._id;
  const role = req.user.role;

  const updated = await updateAppointmentStatus(
    id,
    status,
    notes,
    userId,
    role,
  );
  res.status(200).json({
    success: true,
    message: "Appointment updated successfully",
    data: updated,
  });
};

export const getAppointmentsHandler = async (req, res, next) => {
  const filters = req.query;
  const userId = req.user._id;
  const role = req.user.role;

  const result = await getAppointments(filters, userId, role);
  res.status(200).json({
    success: true,
    data: result,
  });
};
