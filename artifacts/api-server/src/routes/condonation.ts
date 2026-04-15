import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, attendanceCondonationTable } from "@workspace/db";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/attendance-condonation", async (req, res): Promise<void> => {
  const studentId = req.query.studentId ? Number(req.query.studentId) : undefined;
  const status = req.query.status as string | undefined;
  const conditions = [];
  if (studentId) conditions.push(eq(attendanceCondonationTable.studentId, studentId));
  if (status) conditions.push(eq(attendanceCondonationTable.status, status));
  const query = conditions.length > 0 ? db.select().from(attendanceCondonationTable).where(and(...conditions)) : db.select().from(attendanceCondonationTable);
  res.json(await query);
});

router.post("/attendance-condonation", async (req, res): Promise<void> => {
  const [rec] = await db.insert(attendanceCondonationTable).values(req.body).returning();
  await logActivity("condonation_requested", `Attendance condonation request`, String(rec.id));
  res.status(201).json(rec);
});

router.get("/attendance-condonation/:id", async (req, res): Promise<void> => {
  const [rec] = await db.select().from(attendanceCondonationTable).where(eq(attendanceCondonationTable.id, Number(req.params.id)));
  if (!rec) { res.status(404).json({ error: "Not found" }); return; }
  res.json(rec);
});

router.patch("/attendance-condonation/:id", async (req, res): Promise<void> => {
  const [rec] = await db.update(attendanceCondonationTable).set(req.body).where(eq(attendanceCondonationTable.id, Number(req.params.id))).returning();
  if (!rec) { res.status(404).json({ error: "Not found" }); return; }
  res.json(rec);
});

export default router;
