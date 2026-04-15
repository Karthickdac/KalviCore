import { Router, type IRouter } from "express";
import { db, visitorsTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { requireAuth, requirePermission } from "../middleware/auth";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/visitors", requireAuth, requirePermission("visitors"), async (req, res): Promise<void> => {
  try {
    const { status, date } = req.query;
    const conditions: any[] = [];
    if (status && status !== "all") conditions.push(eq(visitorsTable.status, String(status)));
    const visitors = conditions.length > 0
      ? await db.select().from(visitorsTable).where(and(...conditions)).orderBy(desc(visitorsTable.checkInTime)).limit(300)
      : await db.select().from(visitorsTable).orderBy(desc(visitorsTable.checkInTime)).limit(300);
    res.json(visitors);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/visitors", requireAuth, requirePermission("visitors"), async (req, res): Promise<void> => {
  try {
    const { visitorName, phone, email, idProofType, idProofNumber, purpose, personToMeet, department, numberOfVisitors, vehicleNumber, remarks } = req.body;
    if (!visitorName || !purpose || !personToMeet) { res.status(400).json({ error: "Name, purpose, and person to meet required" }); return; }
    const visitorBadge = `VB-${Date.now().toString(36).toUpperCase()}`;
    const [visitor] = await db.insert(visitorsTable).values({
      visitorName, phone, email, idProofType, idProofNumber, purpose, personToMeet,
      department, numberOfVisitors: numberOfVisitors ? Number(numberOfVisitors) : 1,
      vehicleNumber, visitorBadge, remarks,
    }).returning();
    await logActivity("visitor_checked_in", `Visitor checked in: ${visitorName} to meet ${personToMeet}`, String(visitor.id));
    res.json(visitor);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.patch("/visitors/:id/checkout", requireAuth, requirePermission("visitors"), async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const [visitor] = await db.update(visitorsTable).set({
      checkOutTime: new Date(), status: "Checked Out",
    }).where(eq(visitorsTable.id, id)).returning();
    if (!visitor) { res.status(404).json({ error: "Not found" }); return; }
    await logActivity("visitor_checked_out", `Visitor checked out: ${visitor.visitorName}`, String(id));
    res.json(visitor);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete("/visitors/:id", requireAuth, requirePermission("visitors"), async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const [v] = await db.delete(visitorsTable).where(eq(visitorsTable.id, id)).returning();
    if (!v) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/visitors/stats", requireAuth, requirePermission("visitors"), async (_req, res): Promise<void> => {
  try {
    const all = await db.select().from(visitorsTable);
    const today = new Date().toISOString().split("T")[0];
    const todayVisitors = all.filter(v => v.checkInTime && new Date(v.checkInTime).toISOString().split("T")[0] === today);
    res.json({
      total: all.length,
      todayTotal: todayVisitors.length,
      currentlyIn: all.filter(v => v.status === "Checked In").length,
      checkedOut: all.filter(v => v.status === "Checked Out").length,
      purposes: all.reduce((acc: Record<string, number>, v) => { acc[v.purpose] = (acc[v.purpose] || 0) + 1; return acc; }, {}),
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
