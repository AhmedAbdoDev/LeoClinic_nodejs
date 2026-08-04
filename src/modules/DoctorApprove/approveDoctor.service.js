import User from "../../models/user.model.js";
import AppError from "../../error/AppError.js";

export async function approveDoctor(id) {
  const doctor = await User.findOne({
    _id: id,
    role: "doctor",
    is_blocked: false,
  });
  if (!doctor) {
    throw new AppError("doctor not found", 404);
  }
  if (doctor.doctorProfile.is_approved) {
    throw new AppError("Doctor is already approved", 309);
  }
  doctor.doctorProfile.is_approved = true;
  doctor.save();
  return doctor;
}
export async function rejectDoctor(id) {
  const doctor = await User.findOne({
    _id: id,
    role: "doctor",
    is_blocked: false,
  });
  if (!doctor) {
    throw new AppError("doctor not found", 404);
  }
  if (!doctor.doctorProfile.is_approved) {
    throw new AppError("Doctor is already not approved", 309);
  }
  doctor.doctorProfile.is_approved = false;
  doctor.save();
  return doctor;
}
