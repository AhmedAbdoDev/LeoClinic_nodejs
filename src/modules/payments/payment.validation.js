import { z } from "zod";

export const simulatePaymentSchema = z.object({
  body: z.object({
    appointmentId: z.string().length(24, "Invalid appointment ID format"),
    method: z.enum(["cash", "card", "wallet"]),
  }),
});
