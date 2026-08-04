import express from "express";
import cookieParser from "cookie-parser";

import errorHandler from "./utils/errorHandler.js";
import specialtyRoutes from "./modules/specialties/specialty.route.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

import healthRoutes from "./modules/health/health.route.js";
import authRoutes from "./modules/auth/auth.route.js";
import approveRouter from "./modules/DoctorApprove/approveRoute.js";

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/specialties", specialtyRoutes);
app.use("/api/doctors", approveRouter);

app.use(errorHandler);
export default app;
