import express from "express";
import poolPromise from "../db.js";
import jwt from "jsonwebtoken";

const router = express.Router();

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Missing token" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

router.get("/", authenticate, async (req, res) => {
  try {
    const pool = await poolPromise;

    const statsResult = await pool.request().query(`
      SELECT 
        COUNT(*) AS totalAppointments,
        SUM(CASE WHEN UPPER(LTRIM(RTRIM(Status))) = 'INPATIENT' THEN 1 ELSE 0 END) AS inPatient,
        SUM(CASE WHEN UPPER(LTRIM(RTRIM(Status))) = 'OUTPATIENT' THEN 1 ELSE 0 END) AS outPatient,
        SUM(CASE WHEN UPPER(LTRIM(RTRIM(Status))) IN ('PENDING', 'SCHEDULED') THEN 1 ELSE 0 END) AS pending
      FROM Appointments
      WHERE CAST(StartTime AS DATE) = CAST(GETDATE() AS DATE)
    `);

    const stats = statsResult.recordset[0];

    const appointmentsResult = await pool.request().query(`
      SELECT TOP 50
        a.AppointID,
        a.PatientID,
        COALESCE(p.PatientName + ' ' + p.PatientSurname, 'Unknown Patient') AS PatientName,
        a.StartTime,
        a.EndTime,
        a.Status,
        a.ServiceName
      FROM Appointments a
      LEFT JOIN Patients p ON a.PatientID = p.PatientID
      WHERE CAST(a.StartTime AS DATE) = CAST(GETDATE() AS DATE)
      ORDER BY a.StartTime ASC
    `);

    res.json({
      todayAppointments: appointmentsResult.recordset || [],
      inPatient: stats.inPatient || 0,
      outPatient: stats.outPatient || 0,
      pending: stats.pending || 0,
      totalAppointments: stats.totalAppointments || 0
    });
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ message: "Server error fetching dashboard stats" });
  }
});

export default router;
