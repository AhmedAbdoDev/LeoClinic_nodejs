import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

await mongoose.connect(process.env.MONGODB_URI);

const exists = await User.findOne({
  role: "admin",
});

if (exists) {
  console.log("Admin already exists");
  process.exit();
}

const hashedPassword = await bcrypt.hash("Admin@123", 10);

await User.create({
  name: "Admin",
  email: "admin@example.com",
  password: hashedPassword,
  role: "admin",
  contact_number: "0000000000",
  is_verified: true,
});

console.log("Admin created successfully");
console.log("📧 Email: admin@example.com");
console.log("🔑 Password: Admin@123");
process.exit();