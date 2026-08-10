import { z } from "zod";
import {
  objectIdSchema,
  phoneSchema,
  phoneRegex,
} from "../../utils/validation.utils.js";

export const createLocationSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(3, "Location name must be at least 3 characters"),
      address: z.string().trim(),
      city: z.string().trim(),
      phone: phoneSchema,
    })
    .strict(),
});

export const updateLocationSchema = z.object({
  params: z.object({
    locationId: objectIdSchema("locationId"),
  }),
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(3, "Location name must be at least 3 characters")
        .optional(),
      address: z.string().trim().optional(),
      city: z.string().trim().optional(),
      phone: phoneSchema.optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required to update",
    }),
});

export const deleteLocationSchema = z.object({
  params: z.object({
    locationId: objectIdSchema("locationId"),
  }),
});

export const searchLocationSchema = z.object({
  query: z.object({
    location_id: objectIdSchema("location_id").optional(),
    name: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});

export const locationByIdSchema = z.object({
  params: z.object({
    locationId: objectIdSchema("locationId"),
  }),
});
