import { z } from "zod";

export const createSpecialtySchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(3, "Specialty name must be at least 3 characters"),

    description: z
      .string()
      .trim()
      .optional(),
  }),
});