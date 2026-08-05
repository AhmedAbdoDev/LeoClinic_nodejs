import { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  defineAvailabilitySchema,
  updateAvailabilitySchema,
  deleteAvailabilitySlotSchema,
  updateDoctorProfileSchema,
  addDoctorLocationSchema,
  removeDoctorLocationSchema,
} from "./doctor.validation.js";
import {
  defineAvailability,
  updateAvailability,
  deleteAvailabilitySlot,
  updateProfile,
  addLocation,
  removeLocation,
} from "./doctor.controller.js";

const router = Router();

router.post(
  "/availability",
  authMiddleware,
  authorize("doctor"),
  validate(defineAvailabilitySchema),
  defineAvailability,
);

router.patch(
  "/availability/:availabilityId",
  authMiddleware,
  authorize("doctor"),
  validate(updateAvailabilitySchema),
  updateAvailability,
);

router.delete(
  "/availability/:availabilityId/slots/:slotId",
  authMiddleware,
  authorize("doctor"),
  validate(deleteAvailabilitySlotSchema),
  deleteAvailabilitySlot,
);

router.patch(
  "/profile",
  authMiddleware,
  authorize("doctor"),
  validate(updateDoctorProfileSchema),
  updateProfile,
);

router.post(
  "/profile/locations",
  authMiddleware,
  authorize("doctor"),
  validate(addDoctorLocationSchema),
  addLocation,
);

router.delete(
  "/profile/locations/:locationId",
  authMiddleware,
  authorize("doctor"),
  validate(removeDoctorLocationSchema),
  removeLocation,
);

export default router;
