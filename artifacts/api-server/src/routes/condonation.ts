import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, attendanceCondonationTable } from "@workspace/db";
import { requireAuth, requirePermission } from "../middleware/auth";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/attendance-condonation", requireAuth, requirePermission("attendance"), async (req, res): Promise<void> => {
  try {
    const { studentId, status } = req.query;
    const conditions: any[] = [];
    if (studentId) conditions.push(eq(attendanceCondonationTable.studentId, Number(studentId)));
    if (status && status !== "all") conditions.push(eq(attendanceCondonationTable.status, String(status)));
    const query = conditions.length > 0
      ? db.select().from(attendanceCondonationTable).where(and(...conditions))
      : db.select().from(attendanceCondonationTable);
    res.json(await query);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/attendance-condonation", requireAuth, requirePermission("attendance"), async (req, res): Promise<void> => {
  try {
    const { studentId, subjectId, semester, academicYear, currentPercentage, reason, supportingDocument, requestDate } = req.body;
    if (!studentId || !subjectId || !reason) {
      res.status(400).json({ error: "studentId, subjectId, and reason are required" });
      return;
    }
    const [rec] = await db.insert(attendanceCondonationTable).values({
      studentId, subjectId, semester: semester || 1,
      academicYear: academicYear || "2025-2026",
      currentPercentage: currentPercentage || "0",
      reason,
      supportingDocument: supportingDocument || null,
      requestDate: requestDate || new Date().toISOString().split("T")[0],
      status: "Pending",
    }).returning();
    await logActivity("condonation_requested", `Attendance condonation request`, String(rec.id));
    res.status(201).json(rec);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/attendance-condonation/:id", requireAuth, requirePermission("attendance"), async (req, res): Promise<void> => {
  try {
    const [rec] = await db.select().from(attendanceCondonationTable).where(eq(attendanceCondonationTable.id, Number(req.params.id)));
    if (!rec) { res.status(404).json({ error: "Not found" }); return; }
    res.json(rec);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/attendance-condonation/:id", requireAuth, requirePermission("attendance"), async (req, res): Promise<void> => {
  try {
    const { status, approvedBy } = req.body;
    const [rec] = await db.update(attendanceCondonationTable)
      .set({ status, approvedBy: approvedBy || null })
      .where(eq(attendanceCondonationTable.id, Number(req.params.id)))
      .returning();
    if (!rec) { res.status(404).json({ error: "Not found" }); return; }
    await logActivity("condonation_updated", `Condonation ${rec.id} ${status}`, String(rec.id));
    res.json(rec);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
