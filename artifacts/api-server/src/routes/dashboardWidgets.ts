import { Router, type IRouter } from "express";
import { db, dashboardWidgetsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const DEFAULT_WIDGETS = [
  { key: "total_students", label: "Total Students", category: "stats" },
  { key: "total_staff", label: "Total Staff", category: "stats" },
  { key: "total_departments", label: "Departments", category: "stats" },
  { key: "total_courses", label: "Courses", category: "stats" },
  { key: "fee_collection", label: "Fee Collection", category: "finance" },
  { key: "attendance_overview", label: "Attendance Overview", category: "academic" },
  { key: "recent_events", label: "Recent Events", category: "engagement" },
  { key: "department_chart", label: "Department Strength Chart", category: "charts" },
  { key: "fee_trend_chart", label: "Fee Collection Trend", category: "charts" },
  { key: "gender_distribution", label: "Gender Distribution", category: "charts" },
  { key: "pending_leaves", label: "Pending Leaves", category: "hr" },
  { key: "library_stats", label: "Library Statistics", category: "campus" },
];

const router: IRouter = Router();

router.get("/dashboard-widgets", requireAuth, async (req, res): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) { res.json(DEFAULT_WIDGETS.map((w, i) => ({ ...w, visible: true, position: i }))); return; }

    const saved = await db.select().from(dashboardWidgetsTable).where(eq(dashboardWidgetsTable.userId, userId));
    if (saved.length === 0) {
      res.json(DEFAULT_WIDGETS.map((w, i) => ({ ...w, visible: true, position: i })));
      return;
    }

    const result = DEFAULT_WIDGETS.map((w, i) => {
      const s = saved.find(s => s.widgetKey === w.key);
      return { ...w, visible: s ? s.visible : true, position: s ? s.position : i };
    });
    result.sort((a, b) => a.position - b.position);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/dashboard-widgets", requireAuth, async (req, res): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

    const { widgets } = req.body;
    if (!Array.isArray(widgets)) { res.status(400).json({ error: "Provide widgets array" }); return; }

    await db.delete(dashboardWidgetsTable).where(eq(dashboardWidgetsTable.userId, userId));
    for (const w of widgets) {
      await db.insert(dashboardWidgetsTable).values({
        userId, widgetKey: w.key, visible: w.visible, position: w.position,
      });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
