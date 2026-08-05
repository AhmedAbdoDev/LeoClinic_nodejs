import { updatePatientPrivateInfo } from './patient.service.js';

export const updateMyPatientInfo = async (req, res, next) => {
  const updatedUser = await updatePatientPrivateInfo(req.user._id, req.body);
  res.status(200).json({
    success: true,
    message: 'Patient info updated successfully',
    data: updatedUser,
  });
};
