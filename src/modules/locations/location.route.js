import { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createLocationSchema,
  updateLocationSchema,
  deleteLocationSchema,
  searchLocationSchema,
  locationByIdSchema,
} from "./location.validation.js";
import {
  createLocation,
  updateLocation,
  deleteLocation,
  getLocations,
  getLocationById,
} from "./location.controller.js";

const router = Router();

router.get("/", authMiddleware, validate(searchLocationSchema), getLocations);

router.get(
  "/:locationId",
  authMiddleware,
  validate(locationByIdSchema),
  getLocationById,
);

router.post(
  "/",
  authMiddleware,
  authorize("doctor"),
  validate(createLocationSchema),
  createLocation,
);

router.patch(
  "/:locationId",
  authMiddleware,
  authorize("doctor"),
  validate(updateLocationSchema),
  updateLocation,
);

router.delete(
  "/:locationId",
  authMiddleware,
  authorize("doctor"),
  validate(deleteLocationSchema),
  deleteLocation,
);

export default router;
