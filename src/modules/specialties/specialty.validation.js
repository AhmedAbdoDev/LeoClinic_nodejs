import { z } from "zod";
import { objectIdSchema } from "../../utils/validation.utils.js";

export const createSpecialtySchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(3, "Specialty name must be at least 3 characters"),
    description: z.string().trim().optional(),
  }),
});

export const updateSpecialtySchema = z.object({
  params: z.object({
    id: objectIdSchema("specialty_id"),
  }),
  body: z.object({
    name: z.string().trim().min(3).optional(),
    description: z.string().trim().optional(),
  }),
});

export const IdSchema = z.object({
  params: z.object({
    id: objectIdSchema("specialty_id"),
  }),
});
