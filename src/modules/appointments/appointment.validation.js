import { z } from "zod";

export const bookAppointmentSchema = z.object({
  body: z.object({
    availabilityId: z.string().length(24, "Invalid availability ID format"),
    slotId: z.string().length(24, "Invalid slot ID format"),
    appointmentDate: z.coerce.date(),
  }),
});

export const updateAppointmentStatusSchema = z.object({
  body: z.object({
    status: z.enum(["confirmed", "completed", "cancelled"]),
    notes: z.string().optional(),
  }),
  params: z.object({
    id: z.string().length(24, "Invalid appointment ID format"),
  }),
});

export const getAppointmentsSchema = z.object({
  query: z.object({
    status: z
      .enum(["pending", "confirmed", "completed", "cancelled"])
      .optional(),
    doctorId: z.string().length(24).optional(),
    patientId: z.string().length(24).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});
