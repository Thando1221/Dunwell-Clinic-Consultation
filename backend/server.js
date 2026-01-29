import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRouter from "./routes/auth.js";
import dashboardRouter from "./routes/dashboard.js";
import patientsRouter from "./routes/patients.js";
import attendBookingRouter from "./routes/attendBooking.js";
import visitHistoryRouter from "./routes/visitHistory.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/patients", patientsRouter);
app.use("/api/attendBooking", attendBookingRouter);
app.use("/api/visitHistory", visitHistoryRouter);

// Serve frontend build
const frontendPath = path.join(__dirname, "../dist");
app.use(express.static(frontendPath));

// React routing fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://0.0.0.0:${PORT}`));
