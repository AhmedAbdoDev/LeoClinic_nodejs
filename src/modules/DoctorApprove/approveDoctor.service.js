import User from "../../models/user.model.js";
import AppError from "../../error/AppError.js";

export async function approveDoctor(id) {
  const doctor = await User.findOne({
    _id: id,
    role: "doctor",
    "doctorProfile.approval_status": "pending",
  });
  if (!doctor) {
    throw new AppError("doctor not found", 404);
  }

  doctor.doctorProfile.approval_status = "approved";
  await doctor.save();
  return doctor;
}
export async function rejectDoctor(id) {
  const doctor = await User.findOne({
    _id: id,
    role: "doctor",
    "doctorProfile.approval_status": "pending",
  });
  if (!doctor) {
    throw new AppError("doctor not found", 404);
  }

  doctor.doctorProfile.approval_status = "rejected";
  await doctor.save();
  return doctor;
}
