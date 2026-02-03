import express from "express";
import poolPromise, { sql } from "../db.js";

const router = express.Router();

router.get("/today", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        a.AppointID,
        a.PatientID,
        p.PatientName,
        p.PatientSurname,
        a.StartTime,
        a.Status,
        a.MedicalAidNumber,
        a.MedicalAidName,
        a.ServiceName,
        a.ServicePrice,
        a.UserID,
        a.MedicalAid_MainMember,
        a.MainMember__IDNo,
        a.MedicalAid_option,
        a.PaymentMethod,
        a.FinalPrice,
        a.IsStudent,
        a.isFollow_Up
      FROM Appointments a
      LEFT JOIN Patients p ON a.PatientID = p.PatientID
      WHERE CAST(a.StartTime AS DATE) = CAST(GETDATE() AS DATE)
        AND UPPER(LTRIM(RTRIM(a.Status))) = 'INPATIENT'
      ORDER BY a.StartTime ASC
    `);
    res.json(result.recordset || []);
  } catch (error) {
    console.error("Failed to fetch today's bookings:", error);
    res.status(500).json({ message: "Failed to fetch today's bookings" });
  }
});

router.get("/:appointId/visit", async (req, res) => {
  try {
    const { appointId } = req.params;
    const pool = await poolPromise;
    const result = await pool.request()
      .input("appointId", sql.Int, parseInt(appointId))
      .query(`
        SELECT 
          VisitID,
          AppointID,
          Examination,
          History,
          Diagnoses,
          Treatment,
          Health_Education,
          FollowUp_Plan,
          endTime
        FROM Visit
        WHERE AppointID = @appointId
      `);
    
    res.json(result.recordset[0] || null);
  } catch (error) {
    console.error("Failed to fetch visit:", error);
    res.status(500).json({ message: "Failed to fetch visit info" });
  }
});

router.post("/", async (req, res) => {
  const { appointID, examination, history, diagnoses, treatment, healthEducation, followUpPlan } = req.body;

  try {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const existingVisit = await transaction.request()
        .input("appointID", sql.Int, appointID)
        .query("SELECT VisitID FROM Visit WHERE AppointID = @appointID");

      if (existingVisit.recordset.length > 0) {
        await transaction.request()
          .input("appointID", sql.Int, appointID)
          .input("Examination", sql.NVarChar(sql.MAX), examination || null)
          .input("History", sql.NVarChar(sql.MAX), history || null)
          .input("Diagnoses", sql.NVarChar(sql.MAX), diagnoses || null)
          .input("Treatment", sql.NVarChar(sql.MAX), treatment || null)
          .input("HealthEducation", sql.NVarChar(sql.MAX), healthEducation || null)
          .input("FollowUpPlan", sql.NVarChar(sql.MAX), followUpPlan || null)
          .input("endTime", sql.DateTime, new Date())
          .query(`
            UPDATE Visit
            SET
              Examination = @Examination,
              History = @History,
              Diagnoses = @Diagnoses,
              Treatment = @Treatment,
              Health_Education = @HealthEducation,
              FollowUp_Plan = @FollowUp_Plan,
              endTime = @endTime
            WHERE AppointID = @appointID
          `);
      } else {
        await transaction.request()
          .input("appointID", sql.Int, appointID)
          .input("Examination", sql.NVarChar(sql.MAX), examination || null)
          .input("History", sql.NVarChar(sql.MAX), history || null)
          .input("Diagnoses", sql.NVarChar(sql.MAX), diagnoses || null)
          .input("Treatment", sql.NVarChar(sql.MAX), treatment || null)
          .input("HealthEducation", sql.NVarChar(sql.MAX), healthEducation || null)
          .input("FollowUpPlan", sql.NVarChar(sql.MAX), followUpPlan || null)
          .input("endTime", sql.DateTime, new Date())
          .query(`
            INSERT INTO Visit (AppointID, Examination, History, Diagnoses, Treatment, Health_Education, FollowUp_Plan, endTime)
            VALUES (@appointID, @Examination, @History, @Diagnoses, @Treatment, @HealthEducation, @FollowUpPlan, @endTime)
          `);
      }

      await transaction.request()
        .input("appointID", sql.Int, appointID)
        .query(`
          UPDATE Appointments
          SET Status = 'OutPatient'
          WHERE AppointID = @appointID
        `);

      if (followUpPlan) {
        const oldAppointResult = await transaction.request()
          .input("appointID", sql.Int, appointID)
          .query("SELECT * FROM Appointments WHERE AppointID = @appointID");

        const oldAppoint = oldAppointResult.recordset[0];
        if (!oldAppoint) throw new Error("Original appointment not found");

        const followUpDate = new Date(followUpPlan);
        if (isNaN(followUpDate.getTime())) throw new Error("Invalid follow-up datetime");

        await transaction.request()
          .input("PatientID", sql.Int, oldAppoint.PatientID)
          .input("MedicalAidNumber", sql.NVarChar(50), (oldAppoint.MedicalAidNumber || "").substring(0, 50) || null)
          .input("StartTime", sql.DateTime, followUpDate)
          .input("EndTime", sql.DateTime, null)
          .input("UserID", sql.Int, oldAppoint.UserID)
          .input("MedicalAidName", sql.NVarChar(50), (oldAppoint.MedicalAidName || "").substring(0, 50) || null)
          .input("Status", sql.NVarChar(50), "InPatient")
          .input("ServiceName", sql.NVarChar(50), (oldAppoint.ServiceName || "").substring(0, 50) || null)
          .input("ServicePrice", sql.Decimal(10, 2), oldAppoint.ServicePrice || null)
          .input("MedicalAid_MainMember", sql.NVarChar(50), (oldAppoint.MedicalAid_MainMember || "").substring(0, 50) || null)
          .input("MainMember__IDNo", sql.NVarChar(50), (oldAppoint.MainMember__IDNo || "").substring(0, 50) || null)
          .input("MedicalAid_option", sql.NVarChar(50), (oldAppoint.MedicalAid_option || "").substring(0, 50) || null)
          .input("PaymentMethod", sql.NVarChar(50), (oldAppoint.PaymentMethod || "").substring(0, 50) || null)
          .input("FinalPrice", sql.Decimal(10, 2), oldAppoint.FinalPrice || null)
          .input("IsStudent", sql.Bit, oldAppoint.IsStudent === "Yes" || oldAppoint.IsStudent === true || oldAppoint.IsStudent === 1)
          .input("isFollow_Up", sql.NVarChar(3), "Yes")
          .query(`
            INSERT INTO Appointments (
              PatientID, MedicalAidNumber, StartTime, EndTime, UserID,
              MedicalAidName, Status, ServiceName, ServicePrice,
              MedicalAid_MainMember, MainMember__IDNo, MedicalAid_option,
              PaymentMethod, FinalPrice, IsStudent, isFollow_Up
            )
            VALUES (
              @PatientID, @MedicalAidNumber, @StartTime, @EndTime, @UserID,
              @MedicalAidName, @Status, @ServiceName, @ServicePrice,
              @MedicalAid_MainMember, @MainMember__IDNo, @MedicalAid_option,
              @PaymentMethod, @FinalPrice, @IsStudent, @isFollow_Up
            )
          `);
      }

      await transaction.commit();
      res.json({ success: true, message: "Visit recorded successfully" });
    } catch (innerError) {
      await transaction.rollback();
      throw innerError;
    }
  } catch (error) {
    console.error("Failed to record visit:", error);
    res.status(500).json({ message: "Failed to record visit or create follow-up" });
  }
});

export default router;
