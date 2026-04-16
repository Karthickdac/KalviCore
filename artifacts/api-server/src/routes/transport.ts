import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, transportRoutesTable, transportVehiclesTable, transportStopsTable, transportAllocationsTable } from "@workspace/db";
import { logActivity } from "../lib/activity";
import { getUserScope } from "../lib/scopeFilter";

const router: IRouter = Router();

router.get("/transport-routes", async (_req, res): Promise<void> => {
  res.json(await db.select().from(transportRoutesTable).orderBy(transportRoutesTable.routeNumber));
});

router.post("/transport-routes", async (req, res): Promise<void> => {
  const [route] = await db.insert(transportRoutesTable).values(req.body).returning();
  await logActivity("transport_route_created", `Route ${route.routeName} created`, String(route.id));
  res.status(201).json(route);
});

router.get("/transport-routes/:id", async (req, res): Promise<void> => {
  const [route] = await db.select().from(transportRoutesTable).where(eq(transportRoutesTable.id, Number(req.params.id)));
  if (!route) { res.status(404).json({ error: "Not found" }); return; }
  res.json(route);
});

router.patch("/transport-routes/:id", async (req, res): Promise<void> => {
  const [route] = await db.update(transportRoutesTable).set(req.body).where(eq(transportRoutesTable.id, Number(req.params.id))).returning();
  res.json(route);
});

router.delete("/transport-routes/:id", async (req, res): Promise<void> => {
  await db.delete(transportRoutesTable).where(eq(transportRoutesTable.id, Number(req.params.id)));
  res.json({ success: true });
});

router.get("/transport-vehicles", async (req, res): Promise<void> => {
  const routeId = req.query.routeId ? Number(req.query.routeId) : undefined;
  let query = db.select().from(transportVehiclesTable);
  if (routeId) query = query.where(eq(transportVehiclesTable.routeId, routeId)) as any;
  res.json(await query);
});

router.post("/transport-vehicles", async (req, res): Promise<void> => {
  const [vehicle] = await db.insert(transportVehiclesTable).values(req.body).returning();
  await logActivity("vehicle_added", `Vehicle ${vehicle.vehicleNumber} added`, String(vehicle.id));
  res.status(201).json(vehicle);
});

router.patch("/transport-vehicles/:id", async (req, res): Promise<void> => {
  const [vehicle] = await db.update(transportVehiclesTable).set(req.body).where(eq(transportVehiclesTable.id, Number(req.params.id))).returning();
  res.json(vehicle);
});

router.delete("/transport-vehicles/:id", async (req, res): Promise<void> => {
  await db.delete(transportVehiclesTable).where(eq(transportVehiclesTable.id, Number(req.params.id)));
  res.json({ success: true });
});

router.get("/transport-stops", async (req, res): Promise<void> => {
  const routeId = req.query.routeId ? Number(req.query.routeId) : undefined;
  let query = db.select().from(transportStopsTable);
  if (routeId) query = query.where(eq(transportStopsTable.routeId, routeId)) as any;
  res.json(await (query as any).orderBy(transportStopsTable.stopOrder));
});

router.post("/transport-stops", async (req, res): Promise<void> => {
  const [stop] = await db.insert(transportStopsTable).values(req.body).returning();
  res.status(201).json(stop);
});

router.delete("/transport-stops/:id", async (req, res): Promise<void> => {
  await db.delete(transportStopsTable).where(eq(transportStopsTable.id, Number(req.params.id)));
  res.json({ success: true });
});

router.get("/transport-allocations", async (req, res): Promise<void> => {
  const scope = req.user ? getUserScope(req) : null;
  const routeId = req.query.routeId ? Number(req.query.routeId) : undefined;
  const conditions: any[] = [];

  if (scope?.isStudent && scope.studentRecordId) {
    conditions.push(eq(transportAllocationsTable.studentId, scope.studentRecordId));
  }
  if (routeId) conditions.push(eq(transportAllocationsTable.routeId, routeId));

  const records = conditions.length > 0
    ? await db.select().from(transportAllocationsTable).where(and(...conditions))
    : await db.select().from(transportAllocationsTable);
  res.json(records);
});

router.post("/transport-allocations", async (req, res): Promise<void> => {
  const [alloc] = await db.insert(transportAllocationsTable).values(req.body).returning();
  await logActivity("transport_allocated", `Student allocated to transport route`, String(alloc.id));
  res.status(201).json(alloc);
});

router.patch("/transport-allocations/:id", async (req, res): Promise<void> => {
  const [alloc] = await db.update(transportAllocationsTable).set(req.body).where(eq(transportAllocationsTable.id, Number(req.params.id))).returning();
  res.json(alloc);
});

export default router;
