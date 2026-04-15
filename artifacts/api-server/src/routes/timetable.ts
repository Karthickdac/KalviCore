import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, timetableTable } from "@workspace/db";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/timetable", async (req, res): Promise<void> => {
  const deptId = req.query.departmentId ? Number(req.query.departmentId) : undefined;
  const semester = req.query.semester ? Number(req.query.semester) : undefined;
  let query = db.select().from(timetableTable);
  const conditions = [];
  if (deptId) conditions.push(eq(timetableTable.departmentId, deptId));
  if (semester) conditions.push(eq(timetableTable.semester, semester));
  if (conditions.length > 0) query = query.where(and(...conditions)) as any;
  res.json(await (query as any).orderBy(timetableTable.dayOfWeek, timetableTable.periodNumber));
});

router.post("/timetable", async (req, res): Promise<void> => {
  const [entry] = await db.insert(timetableTable).values(req.body).returning();
  await logActivity("timetable_entry_created", `Timetable entry created for ${entry.dayOfWeek}`, String(entry.id));
  res.status(201).json(entry);
});

router.patch("/timetable/:id", async (req, res): Promise<void> => {
  const [entry] = await db.update(timetableTable).set(req.body).where(eq(timetableTable.id, Number(req.params.id))).returning();
  res.json(entry);
});

router.delete("/timetable/:id", async (req, res): Promise<void> => {
  await db.delete(timetableTable).where(eq(timetableTable.id, Number(req.params.id)));
  res.json({ success: true });
});

export default router;
