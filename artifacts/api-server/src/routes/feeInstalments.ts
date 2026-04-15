import { Router, type IRouter } from "express";
import { eq, and, lte, or } from "drizzle-orm";
import { db, feeInstalmentsTable } from "@workspace/db";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/fee-instalments", async (req, res): Promise<void> => {
  const studentId = req.query.studentId ? Number(req.query.studentId) : undefined;
  const status = req.query.status as string | undefined;
  const conditions = [];
  if (studentId) conditions.push(eq(feeInstalmentsTable.studentId, studentId));
  if (status) conditions.push(eq(feeInstalmentsTable.status, status));
  const query = conditions.length > 0 ? db.select().from(feeInstalmentsTable).where(and(...conditions)) : db.select().from(feeInstalmentsTable);
  res.json(await query);
});

router.post("/fee-instalments", async (req, res): Promise<void> => {
  const [inst] = await db.insert(feeInstalmentsTable).values(req.body).returning();
  await logActivity("instalment_created", `Fee instalment #${inst.instalmentNumber}`, String(inst.id));
  res.status(201).json(inst);
});

router.get("/fee-instalments/:id", async (req, res): Promise<void> => {
  const [inst] = await db.select().from(feeInstalmentsTable).where(eq(feeInstalmentsTable.id, Number(req.params.id)));
  if (!inst) { res.status(404).json({ error: "Not found" }); return; }
  res.json(inst);
});

router.patch("/fee-instalments/:id", async (req, res): Promise<void> => {
  const [inst] = await db.update(feeInstalmentsTable).set(req.body).where(eq(feeInstalmentsTable.id, Number(req.params.id))).returning();
  if (!inst) { res.status(404).json({ error: "Not found" }); return; }
  res.json(inst);
});

router.delete("/fee-instalments/:id", async (req, res): Promise<void> => {
  await db.delete(feeInstalmentsTable).where(eq(feeInstalmentsTable.id, Number(req.params.id)));
  res.json({ success: true });
});

router.get("/fee-defaulters", async (req, res): Promise<void> => {
  const today = new Date().toISOString().split('T')[0];
  const defaulters = await db.select().from(feeInstalmentsTable).where(
    and(
      or(eq(feeInstalmentsTable.status, "Overdue"), eq(feeInstalmentsTable.status, "Pending")),
      lte(feeInstalmentsTable.dueDate, today)
    )
  );
  res.json(defaulters);
});

export default router;
