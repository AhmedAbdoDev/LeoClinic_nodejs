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
  searchDoctorsSchema,
  doctorProfileParamSchema,
} from "./doctor.validation.js";
import {
  defineAvailability,
  updateAvailability,
  deleteAvailabilitySlot,
  updateProfile,
  addLocation,
  removeLocation,
  uploadLicenseCertificate,
  getDoctors,
  getDoctorById,
} from "./doctor.controller.js";
import { upload } from "../../middlewares/upload.middleware.js";

const router = Router();

router.get("/", authMiddleware, validate(searchDoctorsSchema), getDoctors);

router.get(
  "/:doctorId",
  authMiddleware,
  validate(doctorProfileParamSchema),
  getDoctorById,
);

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

router.post(
  "/license",
  authMiddleware,
  authorize("doctor"),
  upload.single("license_certificate"),
  uploadLicenseCertificate,
);

export default router;
