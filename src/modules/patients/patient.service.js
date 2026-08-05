import User from '../../models/User.model.js';

export const updatePatientPrivateInfo = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  if (user.role !== 'patient') {
    throw new Error('Forbidden');
  }

  if (updateData.address) user.patientProfile.address = updateData.address;
  if (updateData.date_of_birth) user.patientProfile.date_of_birth = new Date(updateData.date_of_birth);

  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};