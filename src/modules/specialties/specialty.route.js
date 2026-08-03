import { Router } from "express";

import {
  authMiddleware,
  authorize,
} from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import {
  createSpecialtySchema,
  updateSpecialtySchema,
} from "./specialty.validation.js";
import { createSpecialty } from "./specialty.controller.js";
import {
  getAllSpecialties,
  getSpecialtiesById,
  delSpecialtiesById,
  updateSpecialtiesById,
} from "./specialty.controller.js";

const specialtyRoutes = Router();

specialtyRoutes.get("/", authMiddleware, getAllSpecialties);
specialtyRoutes.get("/:id", authMiddleware, getSpecialtiesById);

specialtyRoutes.post(
  "/",
  authMiddleware,
  authorize("admin"),
  validate(createSpecialtySchema),
  createSpecialty,
);

specialtyRoutes.delete(
  "/:id",
  authMiddleware,
  authorize("admin"),
  delSpecialtiesById,
);
specialtyRoutes.patch(
  "/:id",
  authMiddleware,
  validate(updateSpecialtySchema),
  authorize("admin"),
  updateSpecialtiesById,
);

export default specialtyRoutes;
