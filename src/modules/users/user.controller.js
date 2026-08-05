import { updateUserBasicInfo, getUsers } from "./user.service.js";

export const updateMe = async (req, res, next) => {
  const updatedUser = await updateUserBasicInfo(req.user._id, req.body);
  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser,
  });
};

export const getAllUsers = async (req, res, next) => {
  const result = await getUsers(req.query);
  res.status(200).json({
    success: true,
    data: result,
  });
};
