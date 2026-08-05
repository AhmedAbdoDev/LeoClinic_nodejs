import { updatePatientPrivateInfo } from './patient.service.js';
import { updatePatientSchema } from './patient.validation.js';

export const updateMyPatientInfo = async (req, res, next) => {
  try {
    const validatedData = updatePatientSchema.parse(req.body);
    const updatedUser = await updatePatientPrivateInfo(req.user._id, validatedData);
    res.status(200).json({
      success: true,
      message: 'Patient info updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }
    next(error);
  }
};