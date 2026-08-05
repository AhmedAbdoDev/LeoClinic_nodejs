import { z } from "zod";

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    contact_number: z.string().trim().min(10).optional(),
  }),
});

export const getUsersSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    role: z.enum(["admin", "doctor", "patient"]).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});
