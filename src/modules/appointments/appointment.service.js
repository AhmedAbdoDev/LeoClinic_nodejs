import Appointment from "../../models/appointment.model.js";
import Availability from "../../models/availability.model.js";
import Payment from "../../models/payment.model.js";
import AppError from "../../error/AppError.js";
import {
  allowedTransitions,
  getDayName,
  getMinutesFromDate,
  normalizeDay,
} from "./appointment.utils.js";
import { formatTimeLabel } from "../../utils/time.js";
import {
  NotificationActions,
  NotificationEntities,
  NotificationRecipients,
  NotificationTypes,
} from "../notifications/notifications.constants.js";
import { createNotification } from "../notifications/notifications.helper.js";
import userModel from "../../models/user.model.js";

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

  const doctor = await userModel
    .findById(availability.doctor_id)
    .select("name doctorProfile");
  if (!doctor) throw new AppError("Doctor not found", 404);

  const existingAppointment = await Appointment.findOne({
    availability_id: availability._id,
    slot_id: slot._id,
    appointment_date: appointmentDateObject,
    status: { $ne: "cancelled" },
  });

  if (existingAppointment)
    throw new AppError("This slot is already booked for this date", 409);

  let appointment;
  try {
    appointment = await Appointment.create({
      patient_id: patientId,
      doctor_id: availability.doctor_id,
      availability_id: availability._id,
      slot_id: slot._id,
      status: "pending",
      appointment_date: appointmentDateObject,
      notes: "",
      doctor_snapshot: {
        name: doctor.name,
        specialty: doctor.doctorProfile.specialty,
        price: doctor.doctorProfile.price,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError("This slot is already booked for this date", 409);
    }
    throw error;
  }

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
      doctorName: doctor.name,
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

  if (!appointment) throw new AppError("Appointment not found", 404);

  const normalizedUserId = userId.toString();

  const ownerId =
    role === "doctor"
      ? appointment.doctor_id
      : role === "patient"
        ? appointment.patient_id
        : null;

  if (!ownerId) throw new AppError("Forbidden", 403);

  if (ownerId.toString() !== normalizedUserId)
    throw new AppError("You can only update your own appointments", 403);

  const allowedStatuses = allowedTransitions[role]?.[appointment.status] || [];

  if (!allowedStatuses.includes(status))
    throw new AppError(
      `Cannot change appointment status from ${appointment.status} to ${status}`,
      409,
    );

  const doctor = await userModel.findById(appointment.doctor_id).select("name");

  appointment.status = status;

  if (notes !== undefined) appointment.notes = notes;

  await appointment.save();

  if (status === "cancelled") {
    await Promise.all([
      createNotification({
        userId: appointment.patient_id,
        appointmentId: appointment._id,
        recipientRole: NotificationRecipients.PATIENT,
        type: NotificationTypes.APPOINTMENT_CANCELLED,
        entity: NotificationEntities.APPOINTMENT,
        entityId: appointment._id,
        action: NotificationActions.CANCELLED,
      }),

      createNotification({
        userId: appointment.doctor_id,
        appointmentId: appointment._id,
        recipientRole: NotificationRecipients.DOCTOR,
        type: NotificationTypes.APPOINTMENT_CANCELLED,
        entity: NotificationEntities.APPOINTMENT,
        entityId: appointment._id,
        action: NotificationActions.CANCELLED,
      }),
    ]);
  }

  if (status === "confirmed") {
    await createNotification({
      userId: appointment.patient_id,
      appointmentId: appointment._id,
      recipientRole: NotificationRecipients.PATIENT,
      type: NotificationTypes.APPOINTMENT_CONFIRMED,
      entity: NotificationEntities.APPOINTMENT,
      entityId: appointment._id,
      action: NotificationActions.CONFIRMED,
      payload: {
        doctorName: doctor?.name,
      },
    });
  }

  if (status === "completed") {
    await createNotification({
      userId: appointment.patient_id,
      appointmentId: appointment._id,
      recipientRole: NotificationRecipients.PATIENT,
      type: NotificationTypes.APPOINTMENT_COMPLETED,
      entity: NotificationEntities.APPOINTMENT,
      entityId: appointment._id,
      action: NotificationActions.COMPLETED,
      payload: {
        doctorName: doctor?.name,
      },
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

  if (role === "patient") query.patient_id = userId;
  else if (role === "doctor") query.doctor_id = userId;

  const skip = (Number(page) - 1) * Number(limit);
  const [appointments, total] = await Promise.all([
    Appointment.find(query)
      .populate("patient_id", "name email contact_number")
      .populate("doctor_id", "name email")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean(),
    Appointment.countDocuments(query),
  ]);

  const availabilityIds = [
    ...new Set(
      appointments.map((appointment) => appointment.availability_id.toString()),
    ),
  ];

  const availabilities = await Availability.find({
    _id: { $in: availabilityIds },
  })
    .select("location_id slots")
    .lean();

  const availabilityMap = new Map(
    availabilities.map((availability) => [
      availability._id.toString(),
      availability,
    ]),
  );

  const appointmentIds = appointments.map((appointment) => appointment._id);
  const payments = await Payment.find({
    appointment_id: { $in: appointmentIds },
  })
    .select("appointment_id status")
    .lean();

  const paymentMap = new Map(
    payments.map((payment) => [payment.appointment_id.toString(), payment]),
  );

  const appointmentResults = appointments.map((appointment) => {
    const availability = availabilityMap.get(
      appointment.availability_id.toString(),
    );
    const slot = availability?.slots?.find(
      (slotItem) => slotItem._id.toString() === appointment.slot_id.toString(),
    );
    const slotData = slot
      ? {
          _id: slot._id,
          start_time: slot.start_time,
          end_time: slot.end_time,
          timeLabel: formatTimeLabel(slot.start_time, slot.end_time),
        }
      : null;

    const payment = paymentMap.get(appointment._id.toString());

    return {
      _id: appointment._id,
      patient: appointment.patient_id
        ? {
            _id: appointment.patient_id._id,
            name: appointment.patient_id.name,
            email: appointment.patient_id.email,
            contact_number: appointment.patient_id.contact_number,
          }
        : null,
      doctor: appointment.doctor_id
        ? {
            _id: appointment.doctor_id._id,
            name: appointment.doctor_id.name,
            email: appointment.doctor_id.email,
          }
        : null,
      locationId: availability?.location_id || null,
      availabilityId: appointment.availability_id,
      slot: slotData,
      appointment_date: appointment.appointment_date,
      timeLabel: slotData?.timeLabel || null,
      status: appointment.status,
      payment: payment ? { status: payment.status } : null,
      notes: appointment.notes,
      doctor_snapshot: appointment.doctor_snapshot,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  });

  return {
    appointments: appointmentResults,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};
