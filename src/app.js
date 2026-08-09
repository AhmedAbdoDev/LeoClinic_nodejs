import express from "express";
import cookieParser from "cookie-parser";

import errorHandler from "./utils/errorHandler.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

import specialtyRoutes from "./modules/specialties/specialty.route.js";
import healthRoutes from "./modules/health/health.route.js";
import authRoutes from "./modules/auth/auth.route.js";
import approveRouter from "./modules/DoctorApprove/approve.route.js";
import userRoutes from "./modules/users/user.route.js";
import patientRoutes from "./modules/patients/patient.route.js";
import doctorRoutes from "./modules/doctors/doctor.route.js";
import notificationsRoutes from "./modules/notifications/notifications.routes.js";
import appointmentRoutes from "./modules/appointments/appointment.route.js";
import doctorAppointmentRoute from "./modules/doctorAppointment/appointment.route.js";
import ratingsRoutes from "./modules/ratings/rating.route.js";

app.use("/api/doctorAppointments", doctorAppointmentRoute);
app.use("/api/doctors", doctorRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/specialties", specialtyRoutes);
app.use("/api/doctors", approveRouter);
app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/ratings", ratingsRoutes);

app.use(errorHandler);

export default app;
