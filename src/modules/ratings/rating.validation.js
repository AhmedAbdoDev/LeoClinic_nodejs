import { z } from "zod";
import { objectIdSchema } from "../../utils/validation.utils.js";

export const createRatingSchema = z.object({
  body: z.object({
    appointmentId: objectIdSchema("appointment ID"),
    rate: z
      .number()
      .int()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot exceed 5"),
    review: z.string().trim().optional(),
  }),
});

export const getDoctorRatingsSchema = z.object({
  params: z.object({
    doctorId: objectIdSchema("doctor ID"),
  }),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});

export const getAllRatingsSchema = z.object({
  query: z.object({
    doctorId: objectIdSchema("doctor ID").optional(),
    patientId: objectIdSchema("patient ID").optional(),
    rate: z.coerce.number().int().min(1).max(5).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});

export const respondToRatingSchema = z.object({
  params: z.object({
    id: objectIdSchema("rating ID"),
  }),
  body: z.object({
    response: z.string().trim().min(1, "Response cannot be empty"),
  }),
});

export const getMyRatingsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});
