import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, staffLeavesTable } from "@workspace/db";
import { logActivity } from "../lib/activity";
import { getUserScope } from "../lib/scopeFilter";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

router.get("/staff-leaves", requireAuth, async (req, res): Promise<void> => {
  const scope = getUserScope(req);
  const staffId = req.query.staffId ? Number(req.query.staffId) : undefined;
  const status = req.query.status as string | undefined;
  const conditions: any[] = [];

  if (scope && (scope.isFaculty || scope.isStaff) && scope.staffRecordId) {
    conditions.push(eq(staffLeavesTable.staffId, scope.staffRecordId));
  } else if (staffId) {
    conditions.push(eq(staffLeavesTable.staffId, staffId));
  }
  if (status) conditions.push(eq(staffLeavesTable.status, status));

  const records = conditions.length > 0
    ? await db.select().from(staffLeavesTable).where(and(...conditions))
    : await db.select().from(staffLeavesTable);
  res.json(records);
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
