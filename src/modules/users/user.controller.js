import { updateUserBasicInfo } from './user.service.js';
import { updateUserSchema } from './user.validation.js';

export const updateMe = async (req, res, next) => {
  try {
    const validatedData = updateUserSchema.parse(req.body);
    const updatedUser = await updateUserBasicInfo(req.user._id, validatedData);
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
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