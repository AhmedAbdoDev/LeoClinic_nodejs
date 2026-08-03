import { z } from "zod";

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
    id: z.string().min(1, "Specialty ID is required"),
  }),

  body: z.object({
    name: z.string().trim().min(3).optional(),

    description: z.string().trim().optional(),
  }),
});
