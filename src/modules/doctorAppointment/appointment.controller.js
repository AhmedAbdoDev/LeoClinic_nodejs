import * as appointmentService from "./appointment.service.js";

export const getSchedule = async (req, res) => {
  const schedule = await appointmentService.getDoctorSchedule({
    doctorId: req.user._id,
    filters: req.query,
  });
  res.status(200).json({
    success: true,
    data: schedule,
  });
};

export const confirm = async (req, res) => {
  const result = await appointmentService.confirmAppointment({
    doctorId: req.user._id,
    appointmentId: req.params.appointmentId,
    doctorName: req.user.name,
  });
  res.status(200).json({
    success: true,
    data: result,
  });
};

export const complete = async (req, res) => {
  const result = await appointmentService.completeAppointment({
    doctorId: req.user._id,
    appointmentId: req.params.appointmentId,
    notes: req.body.notes,
    doctorName: req.user.name,
  });
  res.status(200).json({
    success: true,
    data: result,
  });
};

export const cancel = async (req, res) => {
  const result = await appointmentService.cancelAppointment({
    doctorId: req.user._id,
    appointmentId: req.params.appointmentId,
    doctorName: req.user.name,
  });
  res.status(200).json({
    success: true,
    data: result,
  });
};
