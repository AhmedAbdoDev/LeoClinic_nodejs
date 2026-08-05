import User from '../../models/User.model.js';

export const updateUserBasicInfo = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (updateData.name) user.name = updateData.name;
  if (updateData.contact_number) user.contact_number = updateData.contact_number;

  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};