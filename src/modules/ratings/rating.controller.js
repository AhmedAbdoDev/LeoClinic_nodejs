import * as ratingService from "./rating.service.js";

export const createRating = async (req, res, next) => {
  const { appointmentId, rate, review } = req.body;
  const patientId = req.user._id;
  const rating = await ratingService.createRating({
    patientId,
    appointmentId,
    rate,
    review,
  });
  res.status(201).json({
    success: true,
    message: "Rating submitted successfully",
    data: rating,
  });
};

export const getDoctorRatings = async (req, res, next) => {
  const { doctorId } = req.params;
  const { page, limit } = req.query;
  const result = await ratingService.getDoctorRatings({
    doctorId,
    page,
    limit,
  });
  res.status(200).json({
    success: true,
    data: result,
  });
};

export const getAllRatings = async (req, res, next) => {
  const filters = req.query;
  const result = await ratingService.getAllRatings({ filters });
  res.status(200).json({
    success: true,
    data: result,
  });
};
export const respondToRating = async (req, res, next) => {
  const { id } = req.params;
  const { response } = req.body;
  const adminId = req.user._id;
  const rating = await ratingService.respondToRating({
    ratingId: id,
    response,
    adminId,
  });
  res.status(200).json({
    success: true,
    message: "Response added successfully",
    data: rating,
  });
};

export const getMyRatings = async (req, res) => {
  const patientId = req.user._id;
  const { page, limit } = req.query;
  const result = await ratingService.getMyRatings({
    patientId,
    page,
    limit,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
};
