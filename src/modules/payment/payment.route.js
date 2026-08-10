import { Router } from "express";

import {
  authMiddleware,
  authorize,
} from "../../middlewares/auth.middleware.js";
import {
  getPaymentRecordsHandler,
  getRevenueReportHandler,
} from "./paymentController.js";

const paymentRouter = Router();

paymentRouter.get(
  "/",
  authMiddleware,
  authorize("admin"),
  getPaymentRecordsHandler,
);

paymentRouter.get(
  "/revenue",
  authMiddleware,
  authorize("admin"),
  getRevenueReportHandler,
);

export default paymentRouter;
