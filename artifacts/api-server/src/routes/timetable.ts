import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, timetableTable } from "@workspace/db";
import { logActivity } from "../lib/activity";
import { getUserScope } from "../lib/scopeFilter";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

router.get("/timetable", requireAuth, async (req, res): Promise<void> => {
  const scope = getUserScope(req);
  const deptId = req.query.departmentId ? Number(req.query.departmentId) : undefined;
  const semester = req.query.semester ? Number(req.query.semester) : undefined;
  let query = db.select().from(timetableTable);
  const conditions: any[] = [];

  if (scope && !scope.isAdmin) {
    if (scope.departmentId) {
      conditions.push(eq(timetableTable.departmentId, scope.departmentId));
    }
  }

  if (deptId) conditions.push(eq(timetableTable.departmentId, deptId));
  if (semester) conditions.push(eq(timetableTable.semester, semester));
  if (conditions.length > 0) query = query.where(and(...conditions)) as any;
  res.json(await (query as any).orderBy(timetableTable.dayOfWeek, timetableTable.periodNumber));
});

router.post("/timetable", requireAuth, async (req, res): Promise<void> => {
  const scope = getUserScope(req);
  if (scope?.isStudent) { res.status(403).json({ error: "Students cannot create timetable entries" }); return; }
  const [entry] = await db.insert(timetableTable).values(req.body).returning();
  await logActivity("timetable_entry_created", `Timetable entry created for ${entry.dayOfWeek}`, String(entry.id));
  res.status(201).json(entry);
});

router.patch("/timetable/:id", requireAuth, async (req, res): Promise<void> => {
  const scope = getUserScope(req);
  if (scope?.isStudent) { res.status(403).json({ error: "Students cannot edit timetable entries" }); return; }
  const [entry] = await db.update(timetableTable).set(req.body).where(eq(timetableTable.id, Number(req.params.id))).returning();
  res.json(entry);
});

router.delete("/timetable/:id", requireAuth, async (req, res): Promise<void> => {
  const scope = getUserScope(req);
  if (scope?.isStudent) { res.status(403).json({ error: "Students cannot delete timetable entries" }); return; }
  await db.delete(timetableTable).where(eq(timetableTable.id, Number(req.params.id)));
  res.json({ success: true });
});

export default router;
