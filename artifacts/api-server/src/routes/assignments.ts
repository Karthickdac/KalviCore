import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, assignmentsTable, assignmentSubmissionsTable } from "@workspace/db";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/assignments", async (req, res): Promise<void> => {
  const subjectId = req.query.subjectId ? Number(req.query.subjectId) : undefined;
  let query = db.select().from(assignmentsTable);
  if (subjectId) query = query.where(eq(assignmentsTable.subjectId, subjectId)) as any;
  res.json(await query);
});

router.post("/assignments", async (req, res): Promise<void> => {
  const [assignment] = await db.insert(assignmentsTable).values(req.body).returning();
  await logActivity("assignment_created", `Assignment "${assignment.title}" created`, String(assignment.id));
  res.status(201).json(assignment);
});

router.get("/assignments/:id", async (req, res): Promise<void> => {
  const [assignment] = await db.select().from(assignmentsTable).where(eq(assignmentsTable.id, Number(req.params.id)));
  if (!assignment) { res.status(404).json({ error: "Not found" }); return; }
  res.json(assignment);
});

router.patch("/assignments/:id", async (req, res): Promise<void> => {
  const [assignment] = await db.update(assignmentsTable).set(req.body).where(eq(assignmentsTable.id, Number(req.params.id))).returning();
  res.json(assignment);
});

router.delete("/assignments/:id", async (req, res): Promise<void> => {
  await db.delete(assignmentsTable).where(eq(assignmentsTable.id, Number(req.params.id)));
  res.json({ success: true });
});

router.get("/assignment-submissions", async (req, res): Promise<void> => {
  const assignmentId = req.query.assignmentId ? Number(req.query.assignmentId) : undefined;
  let query = db.select().from(assignmentSubmissionsTable);
  if (assignmentId) query = query.where(eq(assignmentSubmissionsTable.assignmentId, assignmentId)) as any;
  res.json(await query);
});

router.post("/assignment-submissions", async (req, res): Promise<void> => {
  const [submission] = await db.insert(assignmentSubmissionsTable).values(req.body).returning();
  await logActivity("assignment_submitted", `Assignment submission received`, String(submission.id));
  res.status(201).json(submission);
});

router.patch("/assignment-submissions/:id", async (req, res): Promise<void> => {
  const [submission] = await db.update(assignmentSubmissionsTable).set(req.body).where(eq(assignmentSubmissionsTable.id, Number(req.params.id))).returning();
  res.json(submission);
});

export default router;
