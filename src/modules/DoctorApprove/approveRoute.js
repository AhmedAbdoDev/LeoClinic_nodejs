import { Router } from "express";

import {
  authMiddleware,
  authorize,
} from "../../middlewares/auth.middleware.js";
import { doctorApprove, doctorReject } from "./doctorApprove.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { acceptAndRejectSchema } from "./approve.validation.js";

const approveRouter = Router();

approveRouter.patch(
  "/:doctorId/approve",
  authMiddleware,
  validate(acceptAndRejectSchema),
  authorize("admin"),
  doctorApprove,
);
approveRouter.patch(
  "/:doctorId/reject",
  authMiddleware,
  validate(acceptAndRejectSchema),
  authorize("admin"),
  doctorReject,
);

export default approveRouter;
