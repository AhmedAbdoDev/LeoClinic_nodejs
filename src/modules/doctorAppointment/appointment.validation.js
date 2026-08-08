import { z } from "zod";
import { objectIdSchema } from "../../utils/validation.utils.js";

export const getDoctorScheduleSchema = z.object({
  query: z.object({
    status: z
      .enum(["pending", "confirmed", "completed", "cancelled"])
      .optional(),
    date: z
      .string()
      .refine((date) => !Number.isNaN(Date.parse(date)), {
        message: "Invalid date",
      })
      .optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});

export const appointmentIdParamSchema = z.object({
  params: z.object({
    appointmentId: objectIdSchema("appointmentId"),
  }),
});

export const completeAppointmentSchema = z.object({
  params: z.object({
    appointmentId: objectIdSchema("appointmentId"),
  }),
  body: z.object({
    notes: z
      .string()
      .max(1000, "The Notes cannot exceed 1000 characters")
      .optional(),
  }),
});
