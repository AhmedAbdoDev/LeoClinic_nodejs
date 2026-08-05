import User from '../../models/User.model.js';
import AppError from '../../error/AppError.js';

export const updateUserBasicInfo = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (updateData.name) user.name = updateData.name;
  if (updateData.contact_number) user.contact_number = updateData.contact_number;

  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};
