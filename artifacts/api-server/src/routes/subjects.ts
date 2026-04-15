import { Router, type IRouter } from "express";
import { eq, and, type SQL } from "drizzle-orm";
import { db, subjectsTable } from "@workspace/db";
import {
  CreateSubjectBody,
  ListSubjectsResponse,
  ListSubjectsQueryParams,
  GetSubjectParams,
  GetSubjectResponse,
  UpdateSubjectParams,
  UpdateSubjectBody,
  UpdateSubjectResponse,
  DeleteSubjectParams,
} from "@workspace/api-zod";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/subjects", async (req, res): Promise<void> => {
  const query = ListSubjectsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const conditions: SQL[] = [];
  if (query.data.courseId) conditions.push(eq(subjectsTable.courseId, query.data.courseId));
  if (query.data.semester) conditions.push(eq(subjectsTable.semester, query.data.semester));

  const subjects = conditions.length > 0
    ? await db.select().from(subjectsTable).where(and(...conditions)).orderBy(subjectsTable.code)
    : await db.select().from(subjectsTable).orderBy(subjectsTable.code);
  res.json(ListSubjectsResponse.parse(subjects));
});

router.post("/subjects", async (req, res): Promise<void> => {
  const parsed = CreateSubjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [subject] = await db.insert(subjectsTable).values(parsed.data).returning();
  await logActivity("subject_created", `Subject "${subject.name}" created`, subject.name);
  res.status(201).json(GetSubjectResponse.parse(subject));
});

router.get("/subjects/:id", async (req, res): Promise<void> => {
  const params = GetSubjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [subject] = await db.select().from(subjectsTable).where(eq(subjectsTable.id, params.data.id));
  if (!subject) {
    res.status(404).json({ error: "Subject not found" });
    return;
  }
  res.json(GetSubjectResponse.parse(subject));
});

router.patch("/subjects/:id", async (req, res): Promise<void> => {
  const params = UpdateSubjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateSubjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [subject] = await db.update(subjectsTable).set(parsed.data).where(eq(subjectsTable.id, params.data.id)).returning();
  if (!subject) {
    res.status(404).json({ error: "Subject not found" });
    return;
  }
  res.json(UpdateSubjectResponse.parse(subject));
});

router.delete("/subjects/:id", async (req, res): Promise<void> => {
  const params = DeleteSubjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [subject] = await db.delete(subjectsTable).where(eq(subjectsTable.id, params.data.id)).returning();
  if (!subject) {
    res.status(404).json({ error: "Subject not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
