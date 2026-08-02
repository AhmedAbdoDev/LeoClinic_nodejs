import express from "express";
import errorHandler from "./utils/errorHandler.js";

const app = express();
app.use(express.json());

import authRoutes from "./modules/auth/auth.route.js";
app.use("/api/auth", authRoutes);

app.use(errorHandler);
export default app;
