import { Router, type IRouter } from "express";
import { eq, and, ilike, type SQL } from "drizzle-orm";
import { db, studentsTable } from "@workspace/db";
import {
  CreateStudentBody,
  ListStudentsResponse,
  ListStudentsQueryParams,
  GetStudentParams,
  GetStudentResponse,
  UpdateStudentParams,
  UpdateStudentBody,
  UpdateStudentResponse,
  DeleteStudentParams,
} from "@workspace/api-zod";
import { logActivity } from "../lib/activity";
import { getUserScope } from "../lib/scopeFilter";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

router.get("/students", requireAuth, async (req, res): Promise<void> => {
  const query = ListStudentsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const conditions: SQL[] = [];

  const scope = req.user ? getUserScope(req) : null;
  if (scope?.isStudent && scope.studentRecordId) {
    conditions.push(eq(studentsTable.id, scope.studentRecordId));
  } else if ((scope?.isHOD || scope?.isFaculty) && scope.departmentId) {
    conditions.push(eq(studentsTable.departmentId, scope.departmentId));
  }

  if (query.data.departmentId) conditions.push(eq(studentsTable.departmentId, query.data.departmentId));
  if (query.data.year) conditions.push(eq(studentsTable.year, query.data.year));
  if (query.data.community) conditions.push(eq(studentsTable.community, query.data.community));
  if (query.data.status) conditions.push(eq(studentsTable.status, query.data.status));
  if (query.data.search) {
    conditions.push(ilike(studentsTable.firstName, `%${query.data.search}%`));
  }

  const students = conditions.length > 0
    ? await db.select().from(studentsTable).where(and(...conditions)).orderBy(studentsTable.rollNumber)
    : await db.select().from(studentsTable).orderBy(studentsTable.rollNumber);

  const mapped = students.map(s => ({
    ...s,
    annualIncome: s.annualIncome ? Number(s.annualIncome) : null,
  }));

  res.json(ListStudentsResponse.parse(mapped));
});

router.post("/students", async (req, res): Promise<void> => {
  const parsed = CreateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const values = {
    ...parsed.data,
    annualIncome: parsed.data.annualIncome != null ? String(parsed.data.annualIncome) : null,
  };
  const [student] = await db.insert(studentsTable).values(values).returning();
  await logActivity("student_enrolled", `Student "${student.firstName} ${student.lastName}" enrolled`, `${student.firstName} ${student.lastName}`);
  const mapped = { ...student, annualIncome: student.annualIncome ? Number(student.annualIncome) : null };
  res.status(201).json(GetStudentResponse.parse(mapped));
});

router.get("/students/:id", async (req, res): Promise<void> => {
  const params = GetStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, params.data.id));
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  const mapped = { ...student, annualIncome: student.annualIncome ? Number(student.annualIncome) : null };
  res.json(GetStudentResponse.parse(mapped));
});

router.patch("/students/:id", async (req, res): Promise<void> => {
  const params = UpdateStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const values: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.annualIncome !== undefined) {
    values.annualIncome = parsed.data.annualIncome != null ? String(parsed.data.annualIncome) : null;
  }
  const [student] = await db.update(studentsTable).set(values).where(eq(studentsTable.id, params.data.id)).returning();
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  const mapped = { ...student, annualIncome: student.annualIncome ? Number(student.annualIncome) : null };
  res.json(UpdateStudentResponse.parse(mapped));
});

router.delete("/students/:id", async (req, res): Promise<void> => {
  const params = DeleteStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [student] = await db.delete(studentsTable).where(eq(studentsTable.id, params.data.id)).returning();
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
