import { z } from "zod";
import mongoose from "mongoose";
import {
  emailSchema,
  nameSchema,
  objectIdSchema,
  passwordSchema,
  phoneSchema,
} from "../../utils/validation.utils.js";

const doctorBody = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    role: z.literal("doctor"),
    contact_number: phoneSchema,
    doctorProfile: z.object({
      specialty_id: objectIdSchema("specialty_id"),
      price: z.coerce
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
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    role: z.literal("patient"),
    contact_number: phoneSchema,
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
        .min(3, "Address must be at least 3 characters"),
    }),
  })
  .strict();

export const registerSchema = z.object({
  body: z.discriminatedUnion("role", [doctorBody, patientBody]),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z
      .string({
        required_error: "Verification token is required",
        invalid_type_error: "Verification token must be a string",
      })
      .min(10, "Invalid verification token")
      .max(100, "Invalid verification token"),
  }),
});

export const resendVerificationSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

export const verifyResetPasswordSchema = z.object({
  query: z.object({
    token: z
      .string({
        required_error: "Reset token is required",
        invalid_type_error: "Reset token must be a string",
      })
      .min(10, "Invalid reset token")
      .max(100, "Invalid reset token"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z
      .string({
        required_error: "Reset token is required",
        invalid_type_error: "Reset token must be a string",
      })
      .min(10, "Invalid reset token")
      .max(100, "Invalid reset token"),
    password: passwordSchema,
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
