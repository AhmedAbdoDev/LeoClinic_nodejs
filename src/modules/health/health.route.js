import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;

  res.status(dbConnected ? 200 : 503).json({
    success: dbConnected,
    status: dbConnected ? "UP" : "DOWN",
    database: dbConnected ? "CONNECTED" : "DISCONNECTED",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
