import User from "../../models/user.model.js";
import AppError from "../../error/AppError.js";

export const updatePatientPrivateInfo = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  if (user.role !== "patient") {
    throw new AppError("Only patients can update this info", 403);
  }

  if (updateData.address) user.patientProfile.address = updateData.address;
  if (updateData.date_of_birth)
    user.patientProfile.date_of_birth = new Date(updateData.date_of_birth);

  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};
