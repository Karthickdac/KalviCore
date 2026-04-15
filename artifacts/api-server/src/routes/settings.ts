import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, institutionSettingsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/settings", async (_req, res): Promise<void> => {
  res.json(await db.select().from(institutionSettingsTable));
});

router.get("/settings/:key", async (req, res): Promise<void> => {
  const [setting] = await db.select().from(institutionSettingsTable).where(eq(institutionSettingsTable.key, req.params.key));
  if (!setting) { res.status(404).json({ error: "Not found" }); return; }
  res.json(setting);
});

router.put("/settings/:key", async (req, res): Promise<void> => {
  const existing = await db.select().from(institutionSettingsTable).where(eq(institutionSettingsTable.key, req.params.key));
  if (existing.length > 0) {
    const [setting] = await db.update(institutionSettingsTable).set({ value: req.body.value, description: req.body.description }).where(eq(institutionSettingsTable.key, req.params.key)).returning();
    res.json(setting);
  } else {
    const [setting] = await db.insert(institutionSettingsTable).values({ key: req.params.key, value: req.body.value, category: req.body.category || "General", description: req.body.description }).returning();
    res.status(201).json(setting);
  }
});

router.post("/settings/bulk", async (req, res): Promise<void> => {
  const settings = req.body.settings as { key: string; value: string; category?: string; description?: string }[];
  const results = [];
  for (const s of settings) {
    const existing = await db.select().from(institutionSettingsTable).where(eq(institutionSettingsTable.key, s.key));
    if (existing.length > 0) {
      const [updated] = await db.update(institutionSettingsTable).set({ value: s.value }).where(eq(institutionSettingsTable.key, s.key)).returning();
      results.push(updated);
    } else {
      const [created] = await db.insert(institutionSettingsTable).values({ key: s.key, value: s.value, category: s.category || "General", description: s.description }).returning();
      results.push(created);
    }
  }
  res.json(results);
});

export default router;
