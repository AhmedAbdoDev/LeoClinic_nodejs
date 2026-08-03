import { Router } from "express";

import {
  authMiddleware,
  authorize,
} from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import { createSpecialtySchema } from "./admin.validation.js";
import { createSpecialty } from "./admin.controller.js";
import {
  getAllSpecialties,
  getSpecialtiesById,
  delSpecialtiesById,
  updateSpecialtiesById,
} from "./admin.controller.js";

const adminRoutes = Router();

adminRoutes.post(
  "/specialties",
  authMiddleware,
  authorize("admin"),
  validate(createSpecialtySchema),
  createSpecialty,
);
adminRoutes.get(
  "/specialties",
  authMiddleware,
  authorize("admin"),
  getAllSpecialties,
);
adminRoutes.get(
  "/specialties/:id",
  authMiddleware,
  authorize("admin"),
  getSpecialtiesById,
);
adminRoutes.delete(
  "/specialties/:id",
  authMiddleware,
  authorize("admin"),
  delSpecialtiesById,
);
adminRoutes.patch(
  "/specialties/:id",
  authMiddleware,
  authorize("admin"),
  updateSpecialtiesById,
);

export default adminRoutes;
