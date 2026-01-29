// backend/routes/patients.ts
import express from "express";
import poolPromise, { sql } from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to verify JWT
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Missing token" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // add user info to request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};


// GET /api/patients
router.get("/", authenticate, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT
        PatientID,
        PatientName,
        PatientSurname,
        Patient_ContactNo AS phone,
        Patient_Email AS email,
        DOB AS dob,
        Gender AS gender
      FROM Patients
      ORDER BY PatientName
    `);

    // map DB fields to frontend-friendly format
    const patients = result.recordset.map((p) => ({
      id: p.PatientID,
      name: p.PatientName,
      surname: p.PatientSurname,
      phone: p.phone,
      email: p.email,
      dob: p.dob,
      gender: p.gender,
    }));

    res.json(patients);
  } catch (err) {
    console.error("Failed to fetch patients:", err);
    res.status(500).json({ message: "Server error fetching patients" });
  }
});

export default router;
