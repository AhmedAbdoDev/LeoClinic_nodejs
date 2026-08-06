import { z } from "zod";

export const updatePatientSchema = z.object({
  body: z.object({
    address: z.string().trim().min(3).optional(),
    date_of_birth: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: "Invalid date of birth",
      })
      .optional(),
  }),
});
