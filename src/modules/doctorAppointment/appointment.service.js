import Appointment from "../../models/appointment.model.js";
import Availability from "../../models/availability.model.js";
import AppError from "../../error/AppError.js";
import { createNotification } from "../notifications/notifications.helper.js";
import { NotificationTypes } from "../notifications/notifications.constants.js";

export const getDoctorSchedule = async ({ doctorId, filters }) => {
  const { status, date, page, limit } = filters;
  const query = { doctor_id: doctorId };

  if (status) query.status = status;

  if (date) {
    const startOfDay = new Date(date);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    query.appointment_date = { $gte: startOfDay, $lt: endOfDay };
  }

  const skip = (page - 1) * limit;

  const [appointments, total] = await Promise.all([
    Appointment.find(query)
      .populate("patient_id", "name contact_number")
      .sort({ appointment_date: 1 })
      .skip(skip)
      .limit(limit),
    Appointment.countDocuments(query),
  ]);

  const availabilityIds = [
    ...new Set(appointments.map((apt) => apt.availability_id.toString())),
  ];

  const availabilities = await Availability.find({
    _id: { $in: availabilityIds },
  });

  const availabilityMap = new Map(
    availabilities.map((avail) => [avail._id.toString(), avail]),
  );

  const enrichedAppointments = appointments.map((apt) => {
    const availability = availabilityMap.get(apt.availability_id.toString());
    const slot = availability?.slots.id(apt.slot_id);

    return {
      ...apt.toObject(),
      slot_time: slot
        ? { start_time: slot.start_time, end_time: slot.end_time }
        : null,
    };
  });

  return {
    appointments: enrichedAppointments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const confirmAppointment = async ({
  doctorId,
  appointmentId,
  doctorName,
}) => {
  const appointment = await Appointment.findOne({
    doctor_id: doctorId,
    _id: appointmentId,
  });
  if (!appointment) {
    throw new AppError("Appointment Not found", 404);
  }
  if (appointment.status !== "pending") {
    throw new AppError("Status not Valid", 409);
  }
  appointment.status = "confirmed";
  await appointment.save();

  try {
    await createNotification({
      userId: appointment.patient_id,
      appointmentId: appointment._id,
      recipientRole: "patient",
      type: NotificationTypes.APPOINTMENT_CONFIRMED,
      payload: { doctorName },
      channels: ["database", "email"],
      entity: "appointment",
      entityId: appointment._id,
      action: "confirmed",
    });
  } catch (err) {
    console.error("Failed to send appointment confirmation notification:", err);
  }
  return appointment;
};

export const completeAppointment = async ({
  doctorId,
  appointmentId,
  notes,
  doctorName,
}) => {
  const appointment = await Appointment.findOne({
    doctor_id: doctorId,
    _id: appointmentId,
  });
  if (!appointment) {
    throw new AppError("Appointment Not found", 404);
  }
  if (appointment.status !== "confirmed") {
    throw new AppError("Status not Valid", 409);
  }
  appointment.status = "completed";
  appointment.notes = notes;
  await appointment.save();
  try {
    await createNotification({
      userId: appointment.patient_id,
      appointmentId: appointment._id,
      recipientRole: "patient",
      type: NotificationTypes.APPOINTMENT_COMPLETED,
      payload: { doctorName },
      channels: ["database", "email"],
      entity: "appointment",
      entityId: appointment._id,
      action: "completed",
    });
  } catch (err) {
    console.error("Failed to send appointment completion notification:", err);
  }
  return appointment;
};

export const cancelAppointment = async ({
  doctorId,
  appointmentId,
  doctorName,
}) => {
  const appointment = await Appointment.findOne({
    doctor_id: doctorId,
    _id: appointmentId,
  });
  if (!appointment) {
    throw new AppError("Appointment Not found", 404);
  }
  if (!["pending", "confirmed"].includes(appointment.status)) {
    throw new AppError("Status not valid", 409);
  }
  const availabilityId = appointment.availability_id;
  const availability = await Availability.findOne({
    _id: availabilityId,
    doctor_id: doctorId,
  });
  if (!availability) {
    throw new AppError("Invalid availability", 404);
  }
  const slot = availability.slots.id(appointment.slot_id);
  slot.is_booked = false;
  await availability.save();

  appointment.status = "cancelled";
  await appointment.save();
  try {
    await createNotification({
      userId: appointment.patient_id,
      appointmentId: appointment._id,
      recipientRole: "patient",
      type: NotificationTypes.APPOINTMENT_CANCELLED,
      payload: { doctorName },
      channels: ["database", "email"],
      entity: "appointment",
      entityId: appointment._id,
      action: "cancelled",
    });
  } catch (err) {
    console.error("Failed to send appointment cancellation notification:", err);
  }
  return appointment;
};
