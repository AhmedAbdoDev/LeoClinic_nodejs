import { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import {
  createRatingSchema,
  getAllRatingsSchema,
  getDoctorRatingsSchema,
  getMyRatingsSchema,
  respondToRatingSchema,
} from "./rating.validation.js";
import {
  createRating,
  getAllRatings,
  getDoctorRatings,
  getMyRatings,
  respondToRating,
} from "./rating.controller.js";

const router = Router();

router.get(
  "/",
  authMiddleware,
  authorize("admin"),
  validate(getAllRatingsSchema),
  getAllRatings,
);

router.post(
  "/",
  authMiddleware,
  authorize("patient"),
  validate(createRatingSchema),
  createRating,
);

router.get(
  "/doctor/:doctorId",
  validate(getDoctorRatingsSchema),
  getDoctorRatings,
);

router.patch(
  "/:id/response",
  authMiddleware,
  authorize("admin"),
  validate(respondToRatingSchema),
  respondToRating,
);

router.get(
  "/my-ratings",
  authMiddleware,
  authorize("patient"),
  validate(getMyRatingsSchema),
  getMyRatings,
);

export default router;
