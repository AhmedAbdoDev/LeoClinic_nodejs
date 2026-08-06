import User from '../../models/user.model.js';
import AppError from '../../error/AppError.js';

export const updatePatientPrivateInfo = async (userId, updateData = {}) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  if (user.role !== 'patient') {
    throw new AppError('Only patients can update this info', 403);
  }

  if (!user.patientProfile) {
    user.patientProfile = {};
  }

  if (updateData.address !== undefined) {
    user.patientProfile.address = updateData.address;
  }

  if (updateData.date_of_birth !== undefined) {
    const parsedDate = new Date(updateData.date_of_birth);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new AppError('Invalid date of birth', 400);
    }

    user.patientProfile.date_of_birth = parsedDate;
  }

  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};
