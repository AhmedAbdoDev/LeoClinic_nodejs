import Appointment from "../../models/appointment.model.js";
import Rating from "../../models/rating.model.js";
import AppError from "../../error/AppError.js";
import mongoose from "mongoose";
import {
  NotificationActions,
  NotificationEntities,
  NotificationRecipients,
  NotificationTypes,
} from "../notifications/notifications.constants.js";
import { createNotification } from "../notifications/notifications.helper.js";

export const createRating = async ({
  patientId,
  appointmentId,
  rate,
  review,
}) => {
  const appointment = await Appointment.findById(appointmentId).populate(
    "patient_id",
    "name",
  );
  if (!appointment) throw new AppError("Appointment not found", 404);
  if (!appointment.patient_id._id.equals(patientId))
    throw new AppError("You can only rate your own appointments", 403);

  if (appointment.status !== "completed")
    throw new AppError("You can only rate completed appointments", 400);

  const existingRating = await Rating.findOne({
    appointment_id: appointment._id,
  });

  if (existingRating)
    throw new AppError("You have already rated this appointment", 409);

  const rating = await Rating.create({
    doctor_id: appointment.doctor_id,
    patient_id: patientId,
    appointment_id: appointment._id,
    rate,
    review,
  });
  await createNotification({
    userId: appointment.doctor_id,
    recipientRole: NotificationRecipients.DOCTOR,
    appointmentId: appointment._id,
    type: NotificationTypes.RATING_CREATED,
    entity: NotificationEntities.RATING,
    entityId: rating._id,
    action: NotificationActions.CREATED,
    payload: {
      ratingId: rating._id,
      rate: rating.rate,
      patientName: appointment.patient_id.name,
    },
  });
  return rating;
};

export const getDoctorRatings = async ({ doctorId, page = 1, limit = 10 }) => {
  const skip = (Number(page) - 1) * Number(limit);
  const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
  const [ratings, total, stats] = await Promise.all([
    Rating.find({
      doctor_id: doctorObjectId,
    })
      .select("rate review createdAt")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),

    Rating.countDocuments({
      doctor_id: doctorObjectId,
    }),

    Rating.aggregate([
      { $match: { doctor_id: doctorObjectId } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rate" },
          totalRatings: { $sum: 1 },
        },
      },
    ]),
  ]);

  const averageRating = stats.length
    ? Number(stats[0].averageRating.toFixed(1))
    : 0;

  return {
    ratings,
    summary: {
      averageRating,
      totalRatings: total,
    },
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getAllRatings = async ({ filters }) => {
  const { doctorId, patientId, rate, page = 1, limit = 10 } = filters;
  const query = {};
  if (doctorId) query.doctor_id = doctorId;
  if (patientId) query.patient_id = patientId;
  if (rate) query.rate = rate;
  const skip = (Number(page) - 1) * Number(limit);

  const [ratings, total] = await Promise.all([
    Rating.find(query)
      .populate("doctor_id", "name email contact_number")
      .populate("patient_id", "name email contact_number")
      .populate("appointment_id", "appointment_date status")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 }),

    Rating.countDocuments(query),
  ]);

  return {
    ratings,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
};

export const respondToRating = async ({ ratingId, response, adminId }) => {
  const rating = await Rating.findById(ratingId);
  if (!rating) throw new AppError("Rating not found", 404);
  rating.admin_response = {
    text: response,
    responded_by: adminId,
    responded_at: new Date(),
  };

  await rating.save();
  await createNotification({
    userId: rating.patient_id,
    recipientRole: NotificationRecipients.PATIENT,
    appointmentId: rating.appointment_id,
    type: NotificationTypes.RATING_RESPONDED,
    entity: NotificationEntities.RATING,
    entityId: rating._id,
    action: NotificationActions.RESPONDED,
    payload: {
      ratingId: rating._id,
    },
  });

  return rating;
};

export const getMyRatings = async ({ patientId, page = 1, limit = 10 }) => {
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;
  const query = { patient_id: patientId };
  const [ratings, total] = await Promise.all([
    Rating.find(query)
      .populate("doctor_id", "name")
      .populate("appointment_id", "appointment_date status")
      .select("doctor_id appointment_id rate review admin_response createdAt")
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 }),
    Rating.countDocuments(query),
  ]);

  const formattedRatings = ratings.map((rating) => {
    const ratingObject = rating.toObject();
    if (ratingObject.admin_response)
      ratingObject.admin_response = {
        text: ratingObject.admin_response.text,
        responded_at: ratingObject.admin_response.responded_at,
      };
    return ratingObject;
  });

  return {
    ratings: formattedRatings,
    pagination: {
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    },
  };
};
