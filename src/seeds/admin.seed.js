import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

await mongoose.connect(process.env.MONGO_URL);

const exists = await User.findOne({
  role: "admin",
});

if (exists) {
  console.log("Admin already exists");
  process.exit();
}

const hashedPassword = await bcrypt.hash("ChangeMe123!", 10);

await User.create({
  name: "Admin",
  email: "admin@example.com",
  password: hashedPassword,
  role: "admin",
});

console.log("Admin created successfully");

process.exit();
