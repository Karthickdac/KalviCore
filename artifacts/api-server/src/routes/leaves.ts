import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, staffLeavesTable } from "@workspace/db";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/staff-leaves", async (req, res): Promise<void> => {
  const staffId = req.query.staffId ? Number(req.query.staffId) : undefined;
  const status = req.query.status as string | undefined;
  let query = db.select().from(staffLeavesTable);
  if (staffId) query = query.where(eq(staffLeavesTable.staffId, staffId)) as any;
  if (status) query = query.where(eq(staffLeavesTable.status, status)) as any;
  res.json(await query);
});

router.post("/staff-leaves", async (req, res): Promise<void> => {
  const [leave] = await db.insert(staffLeavesTable).values(req.body).returning();
  await logActivity("leave_applied", `Leave application: ${leave.leaveType}`, String(leave.id));
  res.status(201).json(leave);
});

router.get("/staff-leaves/:id", async (req, res): Promise<void> => {
  const [leave] = await db.select().from(staffLeavesTable).where(eq(staffLeavesTable.id, Number(req.params.id)));
  if (!leave) { res.status(404).json({ error: "Not found" }); return; }
  res.json(leave);
});

router.patch("/staff-leaves/:id", async (req, res): Promise<void> => {
  const [leave] = await db.update(staffLeavesTable).set(req.body).where(eq(staffLeavesTable.id, Number(req.params.id))).returning();
  if (req.body.status === "Approved") {
    await logActivity("leave_approved", `Leave approved for staff`, String(leave.id));
  }
  res.json(leave);
});

export default router;
