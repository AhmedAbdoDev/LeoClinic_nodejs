import { z } from 'zod';

export const updatePatientSchema = z.object({
  body: z.object({
    address: z.string().optional(),
    date_of_birth: z.string().datetime().optional(),
  }),
});
