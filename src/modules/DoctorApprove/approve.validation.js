import { z } from "zod";
import { objectIdSchema } from "../../utils/validation.utils.js";
export const acceptAndRejectSchema = z.object({
  params: z.object({
    doctorId: objectIdSchema,
  }),
});
