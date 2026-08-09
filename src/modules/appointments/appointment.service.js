import Appointment from "../../models/appointment.model.js";
import Availability from "../../models/availability.model.js";
import AppError from "../../error/AppError.js";
import {
  getDayName,
  getMinutesFromDate,
  normalizeDay,
} from "./appointment.utils.js";
import {
  NotificationActions,
  NotificationEntities,
  NotificationRecipients,
  NotificationTypes,
} from "../notifications/notifications.constants.js";
import { createNotification } from "../notifications/notifications.helper.js";

export const bookAppointment = async (
  patientId,
  availabilityId,
  slotId,
  appointmentDate,
) => {
  const availability = await Availability.findOne({
    _id: availabilityId,
  });

  if (!availability) throw new AppError("Availability not found", 404);

  const slot = availability.slots.id(slotId);
  if (!slot) throw new AppError("Slot not found", 404);
  const appointmentDateObject = new Date(appointmentDate);

  if (Number.isNaN(appointmentDateObject.getTime()))
    throw new AppError("Invalid appointment date", 400);

  if (appointmentDateObject.getTime() <= Date.now())
    throw new AppError("Appointment date must be in the future", 400);

  const appointmentDay = getDayName(appointmentDateObject);
  const availabilityDay = normalizeDay(availability.day);

  if (appointmentDay !== availabilityDay)
    throw new AppError(`Appointment date must be on ${availability.day}`, 400);

  const appointmentMinutes = getMinutesFromDate(appointmentDateObject);

  if (appointmentMinutes !== slot.start_time)
    throw new AppError(
      "Appointment time does not match the selected slot",
      400,
    );
  if (slot.is_booked)
    throw new AppError("This slot is no longer available", 409);

  slot.is_booked = true;
  await slot.save();

  const appointment = await Appointment.create({
    patient_id: patientId,
    doctor_id: availability.doctor_id,
    availability_id: availability._id,
    slot_id: slot._id,
    status: "pending",
    appointment_date: appointmentDateObject,
    notes: "",
  });

  const populated = await Appointment.findById(appointment._id)
    .populate("patient_id", "name email")
    .populate("doctor_id", "name email");

  await createNotification({
    userId: patientId,
    appointmentId: appointment._id,
    recipientRole: NotificationRecipients.PATIENT,
    type: NotificationTypes.APPOINTMENT_CREATED,
    entity: NotificationEntities.APPOINTMENT,
    entityId: appointment._id,
    action: NotificationActions.CREATED,
    payload: {
      appointmentId: appointment._id,
      doctorName: populated.doctor_id.name,
    },
  });

  await createNotification({
    userId: availability.doctor_id,
    appointmentId: appointment._id,
    recipientRole: NotificationRecipients.DOCTOR,
    type: NotificationTypes.NEW_APPOINTMENT,
    entity: NotificationEntities.APPOINTMENT,
    entityId: appointment._id,
    action: NotificationActions.NEW,
    payload: {
      appointmentId: appointment._id,
      patientName: populated.patient_id.name,
    },
  });

  return populated;
};

export const updateAppointmentStatus = async (
  appointmentId,
  status,
  notes,
  userId,
  role,
) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  if (role === "doctor" && appointment.doctor_id.toString() !== userId) {
    throw new AppError("You can only update your own appointments", 403);
  }
  if (role === "patient" && appointment.patient_id.toString() !== userId) {
    throw new AppError("You can only update your own appointments", 403);
  }

  appointment.status = status;
  if (notes !== undefined) appointment.notes = notes;
  await appointment.save();

  if (
    status === "cancelled" &&
    appointment.availability_id &&
    appointment.slot_id
  ) {
    const availability = await Availability.findById(
      appointment.availability_id,
    );
    if (availability) {
      const slot = availability.slots.id(appointment.slot_id);
      if (slot) {
        slot.is_booked = false;
        await slot.save();
      }
    }

    await createNotification({
      userId: appointment.patient_id,
      appointmentId: appointment._id,
      recipientRole: NotificationRecipients.PATIENT,
      type: NotificationTypes.APPOINTMENT_CANCELLED,
      entity: NotificationEntities.APPOINTMENT,
      entityId: appointment._id,
      action: NotificationActions.CANCELLED,
    });

    await createNotification({
      userId: appointment.doctor_id,
      appointmentId: appointment._id,
      recipientRole: NotificationRecipients.DOCTOR,
      type: NotificationTypes.APPOINTMENT_CANCELLED,
      entity: NotificationEntities.APPOINTMENT,
      entityId: appointment._id,
      action: NotificationActions.CANCELLED,
    });
  }

  return appointment;
};

export const getAppointments = async (filters, userId, role) => {
  const { status, doctorId, patientId, page = 1, limit = 10 } = filters;
  const query = {};
  if (status) query.status = status;
  if (doctorId) query.doctor_id = doctorId;
  if (patientId) query.patient_id = patientId;

  if (role === "patient") {
    query.patient_id = userId;
  } else if (role === "doctor") {
    query.doctor_id = userId;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [appointments, total] = await Promise.all([
    Appointment.find(query)
      .populate("patient_id", "name email contact_number")
      .populate("doctor_id", "name email")
      .populate("availability_id")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),
    Appointment.countDocuments(query),
  ]);

  return {
    appointments,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};
