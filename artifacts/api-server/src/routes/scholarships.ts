import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, scholarshipsTable } from "@workspace/db";
import { logActivity } from "../lib/activity";
import { getUserScope } from "../lib/scopeFilter";

const router: IRouter = Router();

router.get("/scholarships", async (req, res): Promise<void> => {
  const scope = req.user ? getUserScope(req) : null;
  const studentId = req.query.studentId ? Number(req.query.studentId) : undefined;
  const type = req.query.type as string | undefined;
  const conditions: any[] = [];

  if (scope?.isStudent && scope.studentRecordId) {
    conditions.push(eq(scholarshipsTable.studentId, scope.studentRecordId));
  } else if (studentId) {
    conditions.push(eq(scholarshipsTable.studentId, studentId));
  }
  if (type) conditions.push(eq(scholarshipsTable.type, type));

  const query = conditions.length > 0 ? db.select().from(scholarshipsTable).where(and(...conditions)) : db.select().from(scholarshipsTable);
  res.json(await query);
});

router.post("/scholarships", async (req, res): Promise<void> => {
  const [sch] = await db.insert(scholarshipsTable).values(req.body).returning();
  await logActivity("scholarship_added", `Scholarship: ${sch.scholarshipName}`, String(sch.id));
  res.status(201).json(sch);
});

router.get("/scholarships/:id", async (req, res): Promise<void> => {
  const [sch] = await db.select().from(scholarshipsTable).where(eq(scholarshipsTable.id, Number(req.params.id)));
  if (!sch) { res.status(404).json({ error: "Not found" }); return; }
  res.json(sch);
});

router.patch("/scholarships/:id", async (req, res): Promise<void> => {
  const [sch] = await db.update(scholarshipsTable).set(req.body).where(eq(scholarshipsTable.id, Number(req.params.id))).returning();
  if (!sch) { res.status(404).json({ error: "Not found" }); return; }
  res.json(sch);
});

router.delete("/scholarships/:id", async (req, res): Promise<void> => {
  await db.delete(scholarshipsTable).where(eq(scholarshipsTable.id, Number(req.params.id)));
  res.json({ success: true });
});

export default router;
