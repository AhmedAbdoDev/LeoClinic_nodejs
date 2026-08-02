import { z } from "zod";
import mongoose from "mongoose";

const objectId = z
  .string()
  .refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid specialty id",
  });

const phoneRegex = /^(\+20|0)?1[0125][0-9]{8}$/;

const doctorBody = z
  .object({
    name: z
      .string({
        required_error: "Name is required",
      })
      .trim()
      .min(3, "Name must be at least 3 characters"),

    email: z
      .string({
        required_error: "Email is required",
      })
      .trim()
      .toLowerCase()
      .email("Invalid email address"),

    password: z
      .string({
        required_error: "Password is required",
      })
      .min(6, "Password must be at least 6 characters"),

    role: z.literal("doctor"),

    contact_number: z
      .string({
        required_error: "Contact number is required",
      })
      .regex(phoneRegex, "Invalid phone number"),

    doctorProfile: z.object({
      specialty_id: objectId,

      price: z
        .number({
          required_error: "Price is required",
        })
        .min(0, "Price cannot be negative"),

      bio: z
        .string()
        .trim()
        .max(1000, "Bio cannot exceed 1000 characters")
        .optional(),
    }),
  })
  .strict();

const patientBody = z
  .object({
    name: z
      .string({
        required_error: "Name is required",
      })
      .trim()
      .min(3, "Name must be at least 3 characters"),

    email: z
      .string({
        required_error: "Email is required",
      })
      .trim()
      .toLowerCase()
      .email("Invalid email address"),

    password: z
      .string({
        required_error: "Password is required",
      })
      .min(6, "Password must be at least 6 characters"),

    role: z.literal("patient"),

    contact_number: z
      .string({
        required_error: "Contact number is required",
      })
      .regex(phoneRegex, "Invalid phone number"),

    patientProfile: z.object({
      date_of_birth: z
        .string({
          required_error: "Date of birth is required",
        })
        .datetime("Invalid date of birth"),

      address: z
        .string({
          required_error: "Address is required",
        })
        .trim()
        .min(3, "Address is too short"),
    }),
  })
  .strict();

export const registerSchema = z.object({
  body: z.discriminatedUnion("role", [doctorBody, patientBody]),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z
      .string({
        required_error: "Verification token is required",
        invalid_type_error: "Verification token must be a string",
      })
      .min(10, "Invalid token")
      .max(100, "Invalid token"),
  }),
});

export const refreshTokenSchema = z.object({
  cookies: z.object({
    refreshToken: z
      .string({
        required_error: "Refresh token is required",
        invalid_type_error: "Refresh token must be a string",
      })
      .min(10, "Invalid refresh token")
      .max(100, "Invalid refresh token"),
  }),
});
