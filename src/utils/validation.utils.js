import mongoose from "mongoose";
import { z } from "zod";

const phoneRegex = /^(\+20|0)?1[0125][0-9]{8}$/;

const objectIdSchema = z
  .string({
    required_error: "Specialty is required",
  })
  .refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid specialty id",
  });

const emailSchema = z
  .string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string",
  })
  .trim()
  .toLowerCase()
  .email("Invalid email address");

const passwordSchema = z
  .string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  })
  .min(6, "Password must be at least 6 characters")
  .max(50, "Password must be at most 50 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const nameSchema = z
  .string({
    required_error: "Name is required",
  })
  .trim()
  .min(3, "Name must be at least 3 characters");

const phoneSchema = z
  .string({
    required_error: "Contact number is required",
  })
  .regex(phoneRegex, "Invalid phone number");

export {
  phoneRegex,
  objectIdSchema,
  emailSchema,
  passwordSchema,
  nameSchema,
  phoneSchema,
};
