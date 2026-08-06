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
    blocked: z.enum(["true", "false"]).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});


export const useridSchema = z.object({
  params: z.object({
    userid: z.string().regex(
      /^[0-9a-fA-F]{24}$/,
      "Invalid MongoDB ObjectId"
    ),
  }),
});