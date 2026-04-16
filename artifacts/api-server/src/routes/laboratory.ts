import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, laboratoriesTable, labEquipmentTable, labSchedulesTable } from "@workspace/db";
import { logActivity } from "../lib/activity";
import { requireAuth, requirePermission } from "../middleware/auth";
import { getUserScope } from "../lib/scopeFilter";

const router: IRouter = Router();

router.get("/laboratories", requireAuth, requirePermission("laboratory"), async (req, res): Promise<void> => {
  const scope = getUserScope(req);
  if ((scope.isHOD || scope.isFaculty) && scope.departmentId) {
    const labs = await db.select().from(laboratoriesTable)
      .where(eq(laboratoriesTable.departmentId, scope.departmentId))
      .orderBy(laboratoriesTable.name);
    res.json(labs);
    return;
  }
  res.json(await db.select().from(laboratoriesTable).orderBy(laboratoriesTable.name));
});

router.post("/laboratories", requireAuth, requirePermission("laboratory"), async (req, res): Promise<void> => {
  const [lab] = await db.insert(laboratoriesTable).values(req.body).returning();
  await logActivity("lab_created", `Laboratory "${lab.name}" created`, String(lab.id));
  res.status(201).json(lab);
});

router.get("/laboratories/:id", requireAuth, requirePermission("laboratory"), async (req, res): Promise<void> => {
  const [lab] = await db.select().from(laboratoriesTable).where(eq(laboratoriesTable.id, Number(req.params.id)));
  if (!lab) { res.status(404).json({ error: "Not found" }); return; }
  res.json(lab);
});

router.patch("/laboratories/:id", requireAuth, requirePermission("laboratory"), async (req, res): Promise<void> => {
  const [lab] = await db.update(laboratoriesTable).set(req.body).where(eq(laboratoriesTable.id, Number(req.params.id))).returning();
  res.json(lab);
});

router.delete("/laboratories/:id", requireAuth, requirePermission("laboratory"), async (req, res): Promise<void> => {
  await db.delete(laboratoriesTable).where(eq(laboratoriesTable.id, Number(req.params.id)));
  res.json({ success: true });
});

router.get("/lab-equipment", requireAuth, requirePermission("laboratory"), async (req, res): Promise<void> => {
  const labId = req.query.labId ? Number(req.query.labId) : undefined;
  let query = db.select().from(labEquipmentTable);
  if (labId) query = query.where(eq(labEquipmentTable.labId, labId)) as any;
  res.json(await query);
});

router.post("/lab-equipment", requireAuth, requirePermission("laboratory"), async (req, res): Promise<void> => {
  const [item] = await db.insert(labEquipmentTable).values(req.body).returning();
  await logActivity("lab_equipment_added", `Equipment "${item.name}" added`, String(item.id));
  res.status(201).json(item);
});

router.patch("/lab-equipment/:id", requireAuth, requirePermission("laboratory"), async (req, res): Promise<void> => {
  const [item] = await db.update(labEquipmentTable).set(req.body).where(eq(labEquipmentTable.id, Number(req.params.id))).returning();
  res.json(item);
});

router.delete("/lab-equipment/:id", requireAuth, requirePermission("laboratory"), async (req, res): Promise<void> => {
  await db.delete(labEquipmentTable).where(eq(labEquipmentTable.id, Number(req.params.id)));
  res.json({ success: true });
});

router.get("/lab-schedules", requireAuth, requirePermission("laboratory"), async (req, res): Promise<void> => {
  const labId = req.query.labId ? Number(req.query.labId) : undefined;
  let query = db.select().from(labSchedulesTable);
  if (labId) query = query.where(eq(labSchedulesTable.labId, labId)) as any;
  res.json(await query);
});

router.post("/lab-schedules", requireAuth, requirePermission("laboratory"), async (req, res): Promise<void> => {
  const [schedule] = await db.insert(labSchedulesTable).values(req.body).returning();
  res.status(201).json(schedule);
});

router.patch("/lab-schedules/:id", requireAuth, requirePermission("laboratory"), async (req, res): Promise<void> => {
  const [schedule] = await db.update(labSchedulesTable).set(req.body).where(eq(labSchedulesTable.id, Number(req.params.id))).returning();
  res.json(schedule);
});

router.delete("/lab-schedules/:id", requireAuth, requirePermission("laboratory"), async (req, res): Promise<void> => {
  await db.delete(labSchedulesTable).where(eq(labSchedulesTable.id, Number(req.params.id)));
  res.json({ success: true });
});

export default router;
