import Appointment from '../../models/appointment.model.js';
import Availability from '../../models/availability.model.js';
import Notification from '../../models/notification.model.js';
import AppError from '../../error/AppError.js';
import { timeToMinutes } from '../../utils/time.js';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const getNextDayDate = (day, startMinutes) => {
  const target = DAYS.indexOf(day.toLowerCase());
  if (target === -1) throw new Error('Invalid day');
  const now = new Date();
  let diff = target - now.getDay();
  if (diff <= 0) diff += 7;
  const date = new Date(now);
  date.setDate(now.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  const h = Math.floor(startMinutes / 60);
  const m = startMinutes % 60;
  date.setHours(h, m, 0, 0);
  return date;
};

const buildEventKey = (entity, entityId, action, recipientRole) => {
  return `${entity}:${entityId}:${action}:${recipientRole}`;
};

const createNotification = async ({ userId, appointmentId, recipientRole, type, title, message, data = {} }) => {
  try {
    const eventKey = buildEventKey('appointment', appointmentId, 'created', recipientRole);
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
    console.error('Failed to create notification:', error.message);
  }
};

export const bookAppointment = async (patientId, availabilityId, slotId) => {
  const availability = await Availability.findOne({ _id: availabilityId });
  if (!availability) {
    throw new AppError('Availability not found', 404);
  }

  const slot = availability.slots.id(slotId);
  if (!slot) {
    throw new AppError('Slot not found', 404);
  }
  if (slot.is_booked) {
    throw new AppError('This slot is no longer available', 409);
  }

  slot.is_booked = true;
  await availability.save();

  const startMinutes = typeof slot.start_time === 'string'
    ? timeToMinutes(slot.start_time)
    : slot.start_time;
  const appointmentDate = getNextDayDate(availability.day, startMinutes);

  const appointment = await Appointment.create({
    patient_id: patientId,
    doctor_id: availability.doctor_id,
    availability_id: availability._id,
    slot_id: slot._id,
    appointment_date: appointmentDate,
    status: 'pending',
    notes: '',
  });

  const populated = await Appointment.findById(appointment._id)
    .populate('patient_id', 'name email')
    .populate('doctor_id', 'name email');

 
  await createNotification({
    userId: patientId,
    appointmentId: appointment._id,
    recipientRole: 'patient',
    type: 'appointment_created',
    title: 'Appointment Created',
    message: 'Your appointment has been created successfully.',
  });

 
  await createNotification({
    userId: availability.doctor_id,
    appointmentId: appointment._id,
    recipientRole: 'doctor',
    type: 'appointment_created',
    title: 'New Appointment',
    message: `New appointment booked by ${populated.patient_id.name}.`,
  });

  return populated;
};

export const updateAppointmentStatus = async (appointmentId, status, notes, userId, role) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  if (role === 'doctor' && appointment.doctor_id.toString() !== userId) {
    throw new AppError('You can only update your own appointments', 403);
  }
  if (role === 'patient' && appointment.patient_id.toString() !== userId) {
    throw new AppError('You can only update your own appointments', 403);
  }

  appointment.status = status;
  if (notes !== undefined) appointment.notes = notes;
  await appointment.save();

  if (status === 'cancelled' && appointment.availability_id && appointment.slot_id) {
    const availability = await Availability.findById(appointment.availability_id);
    if (availability) {
      const slot = availability.slots.id(appointment.slot_id);
      if (slot) {
        slot.is_booked = false;
        await availability.save();
      }
    }

    const populated = await Appointment.findById(appointment._id)
      .populate('patient_id', 'name email')
      .populate('doctor_id', 'name email');


    await createNotification({
      userId: appointment.patient_id,
      appointmentId: appointment._id,
      recipientRole: 'patient',
      type: 'appointment_cancelled',
      title: 'Appointment Cancelled',
      message: 'Your appointment has been cancelled.',
    });

    await createNotification({
      userId: appointment.doctor_id,
      appointmentId: appointment._id,
      recipientRole: 'doctor',
      type: 'appointment_cancelled',
      title: 'Appointment Cancelled',
      message: `Appointment with ${populated.patient_id.name} has been cancelled.`,
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

  if (role === 'patient') {
    query.patient_id = userId;
  } else if (role === 'doctor') {
    query.doctor_id = userId;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [appointments, total] = await Promise.all([
    Appointment.find(query)
      .populate('patient_id', 'name email contact_number')
      .populate('doctor_id', 'name email')
      .populate('availability_id')
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