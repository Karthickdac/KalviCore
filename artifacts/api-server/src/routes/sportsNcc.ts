import { Router, type IRouter } from "express";
import { eq, and, type SQL } from "drizzle-orm";
import { db, sportsActivitiesTable, sportsEnrollmentsTable, sportsAchievementsTable } from "@workspace/db";
import { logActivity } from "../lib/activity";
import { requireAuth, requirePermission } from "../middleware/auth";
import { getUserScope } from "../lib/scopeFilter";

const router: IRouter = Router();

router.get("/sports-activities", requireAuth, requirePermission("sports_ncc"), async (req, res): Promise<void> => {
  const category = req.query.category as string | undefined;
  let query = db.select().from(sportsActivitiesTable);
  if (category) query = query.where(eq(sportsActivitiesTable.category, category)) as any;
  res.json(await (query as any).orderBy(sportsActivitiesTable.name));
});

router.post("/sports-activities", requireAuth, requirePermission("sports_ncc"), async (req, res): Promise<void> => {
  const [activity] = await db.insert(sportsActivitiesTable).values(req.body).returning();
  await logActivity("activity_created", `Activity "${activity.name}" created`, String(activity.id));
  res.status(201).json(activity);
});

router.get("/sports-activities/:id", requireAuth, requirePermission("sports_ncc"), async (req, res): Promise<void> => {
  const [activity] = await db.select().from(sportsActivitiesTable).where(eq(sportsActivitiesTable.id, Number(req.params.id)));
  if (!activity) { res.status(404).json({ error: "Not found" }); return; }
  res.json(activity);
});

router.patch("/sports-activities/:id", requireAuth, requirePermission("sports_ncc"), async (req, res): Promise<void> => {
  const [activity] = await db.update(sportsActivitiesTable).set(req.body).where(eq(sportsActivitiesTable.id, Number(req.params.id))).returning();
  res.json(activity);
});

router.delete("/sports-activities/:id", requireAuth, requirePermission("sports_ncc"), async (req, res): Promise<void> => {
  await db.delete(sportsActivitiesTable).where(eq(sportsActivitiesTable.id, Number(req.params.id)));
  res.json({ success: true });
});

router.get("/sports-enrollments", requireAuth, requirePermission("sports_ncc"), async (req, res): Promise<void> => {
  const scope = getUserScope(req);
  const activityId = req.query.activityId ? Number(req.query.activityId) : undefined;
  const conditions: any[] = [];

  if (scope.isStudent && scope.studentRecordId) {
    conditions.push(eq(sportsEnrollmentsTable.studentId, scope.studentRecordId));
  }
  if (activityId) conditions.push(eq(sportsEnrollmentsTable.activityId, activityId));

  const records = conditions.length > 0
    ? await db.select().from(sportsEnrollmentsTable).where(and(...conditions))
    : await db.select().from(sportsEnrollmentsTable);
  res.json(records);
});

router.post("/sports-enrollments", requireAuth, requirePermission("sports_ncc"), async (req, res): Promise<void> => {
  const [enrollment] = await db.insert(sportsEnrollmentsTable).values(req.body).returning();
  await logActivity("sports_enrollment", `Student enrolled in activity`, String(enrollment.id));
  res.status(201).json(enrollment);
});

router.patch("/sports-enrollments/:id", requireAuth, requirePermission("sports_ncc"), async (req, res): Promise<void> => {
  const [enrollment] = await db.update(sportsEnrollmentsTable).set(req.body).where(eq(sportsEnrollmentsTable.id, Number(req.params.id))).returning();
  res.json(enrollment);
});

router.delete("/sports-enrollments/:id", requireAuth, requirePermission("sports_ncc"), async (req, res): Promise<void> => {
  await db.delete(sportsEnrollmentsTable).where(eq(sportsEnrollmentsTable.id, Number(req.params.id)));
  res.json({ success: true });
});

router.get("/sports-achievements", requireAuth, requirePermission("sports_ncc"), async (req, res): Promise<void> => {
  const scope = getUserScope(req);
  const activityId = req.query.activityId ? Number(req.query.activityId) : undefined;
  const studentId = req.query.studentId ? Number(req.query.studentId) : undefined;
  const conditions: SQL[] = [];

  if (scope.isStudent && scope.studentRecordId) {
    conditions.push(eq(sportsAchievementsTable.studentId, scope.studentRecordId));
  } else if (studentId) {
    conditions.push(eq(sportsAchievementsTable.studentId, studentId));
  }
  if (activityId) conditions.push(eq(sportsAchievementsTable.activityId, activityId));

  let query = db.select().from(sportsAchievementsTable);
  if (conditions.length > 0) query = query.where(and(...conditions)) as any;
  res.json(await query);
});

router.post("/sports-achievements", requireAuth, requirePermission("sports_ncc"), async (req, res): Promise<void> => {
  const [achievement] = await db.insert(sportsAchievementsTable).values(req.body).returning();
  await logActivity("achievement_added", `Achievement "${achievement.title}" recorded`, String(achievement.id));
  res.status(201).json(achievement);
});

router.patch("/sports-achievements/:id", requireAuth, requirePermission("sports_ncc"), async (req, res): Promise<void> => {
  const [achievement] = await db.update(sportsAchievementsTable).set(req.body).where(eq(sportsAchievementsTable.id, Number(req.params.id))).returning();
  res.json(achievement);
});

router.delete("/sports-achievements/:id", requireAuth, requirePermission("sports_ncc"), async (req, res): Promise<void> => {
  await db.delete(sportsAchievementsTable).where(eq(sportsAchievementsTable.id, Number(req.params.id)));
  res.json({ success: true });
});

export default router;
