import {
  updateUserBasicInfo,
  getUsers,
  blockUserService,
  unblockUserService,
} from "./user.service.js";

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

export async function blockUser(req, res, next) {
  const id = req.params.userid;
  const user = await blockUserService(id);
  res.status(200).json({
    success: true,
    messege: "user blocked seccessfully",
    data: user,
  });
}
export async function unblockUser(req, res, next) {
  const id = req.params.userid;
  const user = await unblockUserService(id);
  res.status(200).json({
    success: true,
    messege: "user unblocked seccessfully",
    data: user,
  });
}
