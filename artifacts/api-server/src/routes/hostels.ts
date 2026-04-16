import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, hostelsTable, hostelRoomsTable, hostelAllocationsTable, hostelComplaintsTable } from "@workspace/db";
import { logActivity } from "../lib/activity";
import { getUserScope } from "../lib/scopeFilter";

const router: IRouter = Router();

router.get("/hostels", async (_req, res): Promise<void> => {
  const hostels = await db.select().from(hostelsTable).orderBy(hostelsTable.name);
  res.json(hostels);
});

router.post("/hostels", async (req, res): Promise<void> => {
  const [hostel] = await db.insert(hostelsTable).values(req.body).returning();
  await logActivity("hostel_created", `Hostel ${hostel.name} created`, String(hostel.id));
  res.status(201).json(hostel);
});

router.get("/hostels/:id", async (req, res): Promise<void> => {
  const [hostel] = await db.select().from(hostelsTable).where(eq(hostelsTable.id, Number(req.params.id)));
  if (!hostel) { res.status(404).json({ error: "Not found" }); return; }
  res.json(hostel);
});

router.patch("/hostels/:id", async (req, res): Promise<void> => {
  const [hostel] = await db.update(hostelsTable).set(req.body).where(eq(hostelsTable.id, Number(req.params.id))).returning();
  res.json(hostel);
});

router.delete("/hostels/:id", async (req, res): Promise<void> => {
  await db.delete(hostelsTable).where(eq(hostelsTable.id, Number(req.params.id)));
  res.json({ success: true });
});

router.get("/hostel-rooms", async (req, res): Promise<void> => {
  const hostelId = req.query.hostelId ? Number(req.query.hostelId) : undefined;
  let query = db.select().from(hostelRoomsTable);
  if (hostelId) query = query.where(eq(hostelRoomsTable.hostelId, hostelId)) as any;
  res.json(await query);
});

router.post("/hostel-rooms", async (req, res): Promise<void> => {
  const [room] = await db.insert(hostelRoomsTable).values(req.body).returning();
  res.status(201).json(room);
});

router.patch("/hostel-rooms/:id", async (req, res): Promise<void> => {
  const [room] = await db.update(hostelRoomsTable).set(req.body).where(eq(hostelRoomsTable.id, Number(req.params.id))).returning();
  res.json(room);
});

router.delete("/hostel-rooms/:id", async (req, res): Promise<void> => {
  await db.delete(hostelRoomsTable).where(eq(hostelRoomsTable.id, Number(req.params.id)));
  res.json({ success: true });
});

router.get("/hostel-allocations", async (req, res): Promise<void> => {
  const scope = req.user ? getUserScope(req) : null;
  const hostelId = req.query.hostelId ? Number(req.query.hostelId) : undefined;
  const conditions: any[] = [];

  if (scope?.isStudent && scope.studentRecordId) {
    conditions.push(eq(hostelAllocationsTable.studentId, scope.studentRecordId));
  }
  if (hostelId) conditions.push(eq(hostelAllocationsTable.hostelId, hostelId));

  const records = conditions.length > 0
    ? await db.select().from(hostelAllocationsTable).where(and(...conditions))
    : await db.select().from(hostelAllocationsTable);
  res.json(records);
});

router.post("/hostel-allocations", async (req, res): Promise<void> => {
  const [alloc] = await db.insert(hostelAllocationsTable).values(req.body).returning();
  await logActivity("hostel_allocated", `Student allocated to hostel room`, String(alloc.id));
  res.status(201).json(alloc);
});

router.patch("/hostel-allocations/:id", async (req, res): Promise<void> => {
  const [alloc] = await db.update(hostelAllocationsTable).set(req.body).where(eq(hostelAllocationsTable.id, Number(req.params.id))).returning();
  res.json(alloc);
});

router.get("/hostel-complaints", async (req, res): Promise<void> => {
  const scope = req.user ? getUserScope(req) : null;
  const hostelId = req.query.hostelId ? Number(req.query.hostelId) : undefined;
  const conditions: any[] = [];

  if (scope?.isStudent && scope.studentRecordId) {
    conditions.push(eq(hostelComplaintsTable.studentId, scope.studentRecordId));
  }
  if (hostelId) conditions.push(eq(hostelComplaintsTable.hostelId, hostelId));

  const records = conditions.length > 0
    ? await db.select().from(hostelComplaintsTable).where(and(...conditions))
    : await db.select().from(hostelComplaintsTable);
  res.json(records);
});

router.post("/hostel-complaints", async (req, res): Promise<void> => {
  const [complaint] = await db.insert(hostelComplaintsTable).values(req.body).returning();
  await logActivity("hostel_complaint", `Hostel complaint filed: ${complaint.subject}`, String(complaint.id));
  res.status(201).json(complaint);
});

router.patch("/hostel-complaints/:id", async (req, res): Promise<void> => {
  const [complaint] = await db.update(hostelComplaintsTable).set(req.body).where(eq(hostelComplaintsTable.id, Number(req.params.id))).returning();
  res.json(complaint);
});

export default router;
