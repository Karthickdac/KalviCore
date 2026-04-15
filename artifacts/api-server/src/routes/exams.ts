import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, examsTable, examResultsTable } from "@workspace/db";
import {
  CreateExamBody,
  ListExamsResponse,
  ListExamsQueryParams,
  RecordExamResultsBody,
  ListExamResultsResponse,
  ListExamResultsQueryParams,
} from "@workspace/api-zod";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/exams", async (req, res): Promise<void> => {
  const query = ListExamsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  let exams;
  if (query.data.subjectId) {
    exams = await db.select().from(examsTable).where(eq(examsTable.subjectId, query.data.subjectId));
  } else {
    exams = await db.select().from(examsTable).orderBy(examsTable.date);
  }
  res.json(ListExamsResponse.parse(exams));
});

router.post("/exams", async (req, res): Promise<void> => {
  const parsed = CreateExamBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [exam] = await db.insert(examsTable).values(parsed.data).returning();
  await logActivity("exam_created", `${exam.type} exam scheduled for ${exam.date}`, `Exam ${exam.id}`);
  res.status(201).json(exam);
});

router.get("/exam-results", async (req, res): Promise<void> => {
  const query = ListExamResultsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  let results;
  if (query.data.examId) {
    results = await db.select().from(examResultsTable).where(eq(examResultsTable.examId, query.data.examId));
  } else if (query.data.studentId) {
    results = await db.select().from(examResultsTable).where(eq(examResultsTable.studentId, query.data.studentId));
  } else {
    results = await db.select().from(examResultsTable).limit(500);
  }
  res.json(ListExamResultsResponse.parse(results));
});

router.post("/exam-results", async (req, res): Promise<void> => {
  const parsed = RecordExamResultsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const values = parsed.data.results.map(r => ({
    examId: parsed.data.examId,
    studentId: r.studentId,
    marksObtained: r.marksObtained,
    grade: r.grade ?? null,
    status: r.status,
  }));
  const inserted = await db.insert(examResultsTable).values(values).returning();
  await logActivity("exam_results_recorded", `Results recorded for ${inserted.length} students`, `Exam ${parsed.data.examId}`);
  res.status(201).json(ListExamResultsResponse.parse(inserted));
});

export default router;
