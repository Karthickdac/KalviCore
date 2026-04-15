import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, assetsTable, storeItemsTable } from "@workspace/db";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/assets", async (req, res): Promise<void> => {
  const category = req.query.category as string | undefined;
  let query = db.select().from(assetsTable);
  if (category) query = query.where(eq(assetsTable.category, category)) as any;
  res.json(await query);
});

router.post("/assets", async (req, res): Promise<void> => {
  const [asset] = await db.insert(assetsTable).values(req.body).returning();
  await logActivity("asset_added", `Asset ${asset.name} (${asset.assetTag}) added`, String(asset.id));
  res.status(201).json(asset);
});

router.get("/assets/:id", async (req, res): Promise<void> => {
  const [asset] = await db.select().from(assetsTable).where(eq(assetsTable.id, Number(req.params.id)));
  if (!asset) { res.status(404).json({ error: "Not found" }); return; }
  res.json(asset);
});

router.patch("/assets/:id", async (req, res): Promise<void> => {
  const [asset] = await db.update(assetsTable).set(req.body).where(eq(assetsTable.id, Number(req.params.id))).returning();
  res.json(asset);
});

router.delete("/assets/:id", async (req, res): Promise<void> => {
  await db.delete(assetsTable).where(eq(assetsTable.id, Number(req.params.id)));
  res.json({ success: true });
});

router.get("/store-items", async (req, res): Promise<void> => {
  const category = req.query.category as string | undefined;
  let query = db.select().from(storeItemsTable);
  if (category) query = query.where(eq(storeItemsTable.category, category)) as any;
  res.json(await query);
});

router.post("/store-items", async (req, res): Promise<void> => {
  const [item] = await db.insert(storeItemsTable).values(req.body).returning();
  await logActivity("store_item_added", `Store item ${item.name} added`, String(item.id));
  res.status(201).json(item);
});

router.patch("/store-items/:id", async (req, res): Promise<void> => {
  const [item] = await db.update(storeItemsTable).set(req.body).where(eq(storeItemsTable.id, Number(req.params.id))).returning();
  res.json(item);
});

router.delete("/store-items/:id", async (req, res): Promise<void> => {
  await db.delete(storeItemsTable).where(eq(storeItemsTable.id, Number(req.params.id)));
  res.json({ success: true });
});

export default router;
