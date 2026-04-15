import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, eventsTable, eventParticipantsTable } from "@workspace/db";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/events", async (req, res): Promise<void> => {
  const type = req.query.type as string | undefined;
  let query = db.select().from(eventsTable);
  if (type) query = query.where(eq(eventsTable.type, type)) as any;
  res.json(await (query as any).orderBy(eventsTable.startDate));
});

router.post("/events", async (req, res): Promise<void> => {
  const [event] = await db.insert(eventsTable).values(req.body).returning();
  await logActivity("event_created", `Event "${event.title}" created`, String(event.id));
  res.status(201).json(event);
});

router.get("/events/:id", async (req, res): Promise<void> => {
  const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, Number(req.params.id)));
  if (!event) { res.status(404).json({ error: "Not found" }); return; }
  res.json(event);
});

router.patch("/events/:id", async (req, res): Promise<void> => {
  const [event] = await db.update(eventsTable).set(req.body).where(eq(eventsTable.id, Number(req.params.id))).returning();
  res.json(event);
});

router.delete("/events/:id", async (req, res): Promise<void> => {
  await db.delete(eventsTable).where(eq(eventsTable.id, Number(req.params.id)));
  res.json({ success: true });
});

router.get("/event-participants", async (req, res): Promise<void> => {
  const eventId = req.query.eventId ? Number(req.query.eventId) : undefined;
  let query = db.select().from(eventParticipantsTable);
  if (eventId) query = query.where(eq(eventParticipantsTable.eventId, eventId)) as any;
  res.json(await query);
});

router.post("/event-participants", async (req, res): Promise<void> => {
  const [participant] = await db.insert(eventParticipantsTable).values(req.body).returning();
  await logActivity("event_registration", `Student registered for event`, String(participant.id));
  res.status(201).json(participant);
});

router.patch("/event-participants/:id", async (req, res): Promise<void> => {
  const [participant] = await db.update(eventParticipantsTable).set(req.body).where(eq(eventParticipantsTable.id, Number(req.params.id))).returning();
  res.json(participant);
});

router.delete("/event-participants/:id", async (req, res): Promise<void> => {
  await db.delete(eventParticipantsTable).where(eq(eventParticipantsTable.id, Number(req.params.id)));
  res.json({ success: true });
});

export default router;
