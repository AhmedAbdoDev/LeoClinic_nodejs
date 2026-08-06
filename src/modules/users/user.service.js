import User from "../../models/user.model.js";
import AppError from "../../error/AppError.js";

export const updateUserBasicInfo = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  if (updateData.name !== undefined) user.name = updateData.name.trim();
  if (updateData.contact_number !== undefined)
    user.contact_number = updateData.contact_number;
  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

export const getUsers = async (filters) => {
  const { search, role, blocked, page = 1, limit = 10 } = filters || {};
  const query = {};

  if (role) query.role = role;

  if (blocked !== undefined) {
    query.is_blocked = blocked === "true";
  }

  if (search)
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];

  const normalizedPage = Number(page) > 0 ? Number(page) : 1;
  const normalizedLimit = Number(limit) > 0 ? Number(limit) : 10;
  const skip = (normalizedPage - 1) * normalizedLimit;
  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .skip(skip)
      .limit(normalizedLimit)
      .sort({ createdAt: -1 }),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      total,
      page: normalizedPage,
      limit: normalizedLimit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export async function blockUserService(id) {
  const user = await User.findOne({
    _id: id,
    is_blocked: false,
  });
  if (!user) {
    throw new AppError("user blocked or not found");
  }
  user.is_blocked = true;
  await user.save();

  return user;
}
export async function unblockUserService(id) {
  const user = await User.findOne({
    _id: id,
    is_blocked: true,
  });
  if (!user) {
    throw new AppError("user not blocked or not found");
  }
  user.is_blocked = false;
  await user.save();

  return user;
}
