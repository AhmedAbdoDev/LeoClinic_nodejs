import User from "../../models/user.model.js";
import AppError from "../../error/AppError.js";

export const updateUserBasicInfo = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (updateData.name) user.name = updateData.name;
  if (updateData.contact_number)
    user.contact_number = updateData.contact_number;

  await user.save();

  const userObj = user.toObject();
  delete userObj.password;
  return userObj;
};

export const getUsers = async (filters) => {
  const { search, role, page, limit } = filters;

  const query = {};

  if (role) {
    query.role = role;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
