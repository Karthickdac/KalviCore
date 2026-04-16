import { Router, type IRouter } from "express";
import { db, academicCalendarTable } from "@workspace/db";
import { eq, and, gte, lte } from "drizzle-orm";
import { requireAuth, requirePermission } from "../middleware/auth";

const router: IRouter = Router();

router.get("/academic-calendar", requireAuth, requirePermission("calendar"), async (req, res): Promise<void> => {
  const { month, year, eventType } = req.query;
  let conditions: any[] = [];
  if (eventType) conditions.push(eq(academicCalendarTable.eventType, String(eventType)));
  if (year && month) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59);
    conditions.push(gte(academicCalendarTable.startDate, start));
    conditions.push(lte(academicCalendarTable.startDate, end));
  }

  const events = conditions.length > 0
    ? await db.select().from(academicCalendarTable).where(and(...conditions))
    : await db.select().from(academicCalendarTable);
  res.json(events);
});

router.post("/academic-calendar", requireAuth, requirePermission("calendar"), async (req, res): Promise<void> => {
  const values = {
    ...req.body,
    startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
    endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
  };
  const [event] = await db.insert(academicCalendarTable).values(values).returning();
  res.status(201).json(event);
});

router.patch("/academic-calendar/:id", requireAuth, requirePermission("calendar"), async (req, res): Promise<void> => {
  const [event] = await db.update(academicCalendarTable).set(req.body).where(eq(academicCalendarTable.id, Number(req.params.id))).returning();
  if (!event) { res.status(404).json({ error: "Not found" }); return; }
  res.json(event);
});

router.delete("/academic-calendar/:id", requireAuth, requirePermission("calendar"), async (req, res): Promise<void> => {
  await db.delete(academicCalendarTable).where(eq(academicCalendarTable.id, Number(req.params.id)));
  res.json({ success: true });
});

export default router;
