import { z } from "zod";
import mongoose from "mongoose";
import { DAYS, SLOT_RULES } from "./doctor.constants.js";
import { timeToMinutes } from "../../utils/time.js";

const objectIdSchema = (fieldName) =>
  z
    .string({ required_error: `${fieldName} is required` })
    .refine((id) => mongoose.Types.ObjectId.isValid(id), {
      message: `Invalid ${fieldName}`,
    });

const timeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:mm format");

const baseRangeShape = {
  start_time: timeStringSchema,
  end_time: timeStringSchema,
  slot_duration_minutes: z
    .number({ required_error: "slot_duration_minutes is required" })
    .int()
    .min(SLOT_RULES.MIN_DURATION_MINUTES)
    .max(SLOT_RULES.MAX_DURATION_MINUTES),
};

const withRangeValidation = (objectSchema) =>
  objectSchema
    .refine(
      (data) => timeToMinutes(data.end_time) > timeToMinutes(data.start_time),
      { message: "end_time must be after start_time", path: ["end_time"] },
    )
    .refine(
      (data) =>
        timeToMinutes(data.end_time) - timeToMinutes(data.start_time) >=
        data.slot_duration_minutes,
      {
        message: "Range must be at least as long as one slot_duration_minutes",
        path: ["end_time"],
      },
    )
    .transform((data) => ({
      ...data,
      start_time: timeToMinutes(data.start_time),
      end_time: timeToMinutes(data.end_time),
    }));

export const defineAvailabilitySchema = z.object({
  body: withRangeValidation(
    z.object({
      day: z.enum(DAYS, {
        errorMap: () => ({ message: `day must be one of: ${DAYS.join(", ")}` }),
      }),
      location_id: objectIdSchema("location_id"),
      ...baseRangeShape,
    }),
  ),
});

export const updateAvailabilitySchema = z.object({
  params: z.object({
    availabilityId: objectIdSchema("availabilityId"),
  }),
  body: withRangeValidation(z.object({ ...baseRangeShape })),
});

export const deleteAvailabilitySlotSchema = z.object({
  params: z.object({
    availabilityId: objectIdSchema("availabilityId"),
    slotId: objectIdSchema("slotId"),
  }),
});

export const updateDoctorProfileSchema = z.object({
  body: z
    .object({
      contact_number: phoneSchema.optional(),
      bio: z
        .string()
        .trim()
        .max(1000, "Bio cannot exceed 1000 characters")
        .optional(),
      price: z.number().min(0, "Price cannot be negative").optional(),
      specialty_id: objectIdSchema("specialty_id").optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required to update",
    }),
});

export const addDoctorLocationSchema = z.object({
  body: z.object({
    location_id: objectIdSchema("location_id"),
  }),
});

export const removeDoctorLocationSchema = z.object({
  params: z.object({
    locationId: objectIdSchema("locationId"),
  }),
});
