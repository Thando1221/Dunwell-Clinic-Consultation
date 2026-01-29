import express from "express";
import { query } from "../db.js";

const router = express.Router();

/**
 * GET /api/visitHistory/:patientId
 * Get all visits for a given patient
 */
router.get("/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;

    const visits = await query(
      `SELECT 
        v.VisitID,
        v.AppointID,
        v.Examination,
        v.History,
        v.Diagnoses,
        v.Treatment,
        v.Health_Education,
        v.FollowUp_Plan,
        v.endTime,
        p.PatientName,
        p.PatientSurname
      FROM Visit v
      INNER JOIN Appointments a ON v.AppointID = a.AppointID
      INNER JOIN Patients p ON a.PatientID = p.PatientID
      WHERE p.PatientID = @p0
      ORDER BY v.endTime DESC`,
      [patientId]
    );

    const result = visits.map((v) => ({
      visitId: v.VisitID,
      appointId: v.AppointID,
      examination: v.Examination,
      history: v.History,
      diagnoses: v.Diagnoses,
      treatment: v.Treatment,
      healthEducation: v.Health_Education,
      followUpPlan: v.FollowUp_Plan,
      endTime: v.endTime,
      patientName: `${v.PatientName} ${v.PatientSurname}`,
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching visit history:", error);
    res.status(500).json({ message: "Server error fetching visit history" });
  }
});

export default router;
