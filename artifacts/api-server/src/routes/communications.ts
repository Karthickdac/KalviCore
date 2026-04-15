import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, announcementsTable, grievancesTable } from "@workspace/db";
import { requireAuth, requirePermission } from "../middleware/auth";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/announcements", requireAuth, requirePermission("communications"), async (req, res): Promise<void> => {
  const type = req.query.type as string | undefined;
  let query = db.select().from(announcementsTable);
  if (type) query = query.where(eq(announcementsTable.type, type)) as any;
  res.json(await query);
});

router.post("/announcements", requireAuth, requirePermission("communications"), async (req, res): Promise<void> => {
  const [announcement] = await db.insert(announcementsTable).values(req.body).returning();
  await logActivity("announcement_created", `Announcement: ${announcement.title}`, String(announcement.id));
  res.status(201).json(announcement);
});

router.get("/announcements/:id", requireAuth, requirePermission("communications"), async (req, res): Promise<void> => {
  const [announcement] = await db.select().from(announcementsTable).where(eq(announcementsTable.id, Number(req.params.id)));
  if (!announcement) { res.status(404).json({ error: "Not found" }); return; }
  res.json(announcement);
});

router.patch("/announcements/:id", requireAuth, requirePermission("communications"), async (req, res): Promise<void> => {
  const [announcement] = await db.update(announcementsTable).set(req.body).where(eq(announcementsTable.id, Number(req.params.id))).returning();
  res.json(announcement);
});

router.delete("/announcements/:id", requireAuth, requirePermission("communications"), async (req, res): Promise<void> => {
  await db.delete(announcementsTable).where(eq(announcementsTable.id, Number(req.params.id)));
  res.json({ success: true });
});

router.get("/grievances", requireAuth, requirePermission("communications"), async (req, res): Promise<void> => {
  const status = req.query.status as string | undefined;
  let query = db.select().from(grievancesTable);
  if (status) query = query.where(eq(grievancesTable.status, status)) as any;
  res.json(await query);
});

router.post("/grievances", requireAuth, requirePermission("communications"), async (req, res): Promise<void> => {
  const [grievance] = await db.insert(grievancesTable).values(req.body).returning();
  await logActivity("grievance_filed", `Grievance filed: ${grievance.subject}`, String(grievance.id));
  res.status(201).json(grievance);
});

router.get("/grievances/:id", requireAuth, requirePermission("communications"), async (req, res): Promise<void> => {
  const [grievance] = await db.select().from(grievancesTable).where(eq(grievancesTable.id, Number(req.params.id)));
  if (!grievance) { res.status(404).json({ error: "Not found" }); return; }
  res.json(grievance);
});

router.patch("/grievances/:id", requireAuth, requirePermission("communications"), async (req, res): Promise<void> => {
  const [grievance] = await db.update(grievancesTable).set(req.body).where(eq(grievancesTable.id, Number(req.params.id))).returning();
  res.json(grievance);
});

export default router;
