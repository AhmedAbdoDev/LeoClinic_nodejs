import { z } from 'zod';

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    contact_number: z.string().trim().min(10).optional(),
  }),
});
