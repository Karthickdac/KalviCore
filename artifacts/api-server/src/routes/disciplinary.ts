import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, disciplinaryRecordsTable } from "@workspace/db";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/disciplinary-records", async (req, res): Promise<void> => {
  const studentId = req.query.studentId ? Number(req.query.studentId) : undefined;
  let query = db.select().from(disciplinaryRecordsTable);
  if (studentId) query = query.where(eq(disciplinaryRecordsTable.studentId, studentId)) as any;
  res.json(await query);
});

router.post("/disciplinary-records", async (req, res): Promise<void> => {
  const [rec] = await db.insert(disciplinaryRecordsTable).values(req.body).returning();
  await logActivity("disciplinary_added", `Disciplinary record: ${rec.category}`, String(rec.id));
  res.status(201).json(rec);
});

router.get("/disciplinary-records/:id", async (req, res): Promise<void> => {
  const [rec] = await db.select().from(disciplinaryRecordsTable).where(eq(disciplinaryRecordsTable.id, Number(req.params.id)));
  if (!rec) { res.status(404).json({ error: "Not found" }); return; }
  res.json(rec);
});

router.patch("/disciplinary-records/:id", async (req, res): Promise<void> => {
  const [rec] = await db.update(disciplinaryRecordsTable).set(req.body).where(eq(disciplinaryRecordsTable.id, Number(req.params.id))).returning();
  if (!rec) { res.status(404).json({ error: "Not found" }); return; }
  res.json(rec);
});

router.delete("/disciplinary-records/:id", async (req, res): Promise<void> => {
  await db.delete(disciplinaryRecordsTable).where(eq(disciplinaryRecordsTable.id, Number(req.params.id)));
  res.json({ success: true });
});

export default router;
