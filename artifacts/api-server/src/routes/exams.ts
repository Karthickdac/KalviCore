import { Router, type IRouter } from "express";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { db, examsTable, examResultsTable, subjectsTable, studentsTable, departmentsTable, coursesTable } from "@workspace/db";
import { requireAuth, requirePermission } from "../middleware/auth";
import { logActivity } from "../lib/activity";
import { getUserScope } from "../lib/scopeFilter";

const router: IRouter = Router();

const GRADE_MAP = [
  { min: 91, grade: "O", points: 10 },
  { min: 81, grade: "A+", points: 9 },
  { min: 71, grade: "A", points: 8 },
  { min: 61, grade: "B+", points: 7 },
  { min: 51, grade: "B", points: 6 },
  { min: 41, grade: "C", points: 5 },
  { min: 0, grade: "F", points: 0 },
];

function calculateGrade(marks: number, maxMarks: number, passMarks?: number | null): { grade: string; status: string } {
  const pct = Math.round((marks / maxMarks) * 100);
  const threshold = passMarks ? Math.round((passMarks / maxMarks) * 100) : 40;
  if (pct < threshold) return { grade: "F", status: "Fail" };
  const entry = GRADE_MAP.find(g => pct >= g.min) || GRADE_MAP[GRADE_MAP.length - 1];
  return { grade: entry.grade, status: "Pass" };
}

router.get("/exams", requireAuth, requirePermission("exams"), async (req, res): Promise<void> => {
  try {
    const scope = getUserScope(req);
    const { departmentId, courseId, type, semester, status, academicYear } = req.query;
    const conditions: any[] = [];

    if (!scope.isAdmin && scope.departmentId) {
      conditions.push(eq(examsTable.departmentId, scope.departmentId));
    }

    if (departmentId && departmentId !== "all") conditions.push(eq(examsTable.departmentId, Number(departmentId)));
    if (courseId && courseId !== "all") conditions.push(eq(examsTable.courseId, Number(courseId)));
    if (type && type !== "all") conditions.push(eq(examsTable.type, String(type)));
    if (semester && semester !== "all") conditions.push(eq(examsTable.semester, Number(semester)));
    if (status && status !== "all") conditions.push(eq(examsTable.status, String(status)));
    if (academicYear && academicYear !== "all") conditions.push(eq(examsTable.academicYear, String(academicYear)));

    const exams = await db.select({
      id: examsTable.id,
      subjectId: examsTable.subjectId,
      departmentId: examsTable.departmentId,
      courseId: examsTable.courseId,
      type: examsTable.type,
      maxMarks: examsTable.maxMarks,
      passMarks: examsTable.passMarks,
      date: examsTable.date,
      startTime: examsTable.startTime,
      endTime: examsTable.endTime,
      duration: examsTable.duration,
      venue: examsTable.venue,
      semester: examsTable.semester,
      academicYear: examsTable.academicYear,
      status: examsTable.status,
      instructions: examsTable.instructions,
      createdAt: examsTable.createdAt,
      subjectName: subjectsTable.name,
      subjectCode: subjectsTable.code,
    })
    .from(examsTable)
    .leftJoin(subjectsTable, eq(examsTable.subjectId, subjectsTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(examsTable.date));

    res.json(exams);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/exams/:id", requireAuth, requirePermission("exams"), async (req, res): Promise<void> => {
  try {
    const [exam] = await db.select({
      id: examsTable.id,
      subjectId: examsTable.subjectId,
      departmentId: examsTable.departmentId,
      courseId: examsTable.courseId,
      type: examsTable.type,
      maxMarks: examsTable.maxMarks,
      passMarks: examsTable.passMarks,
      date: examsTable.date,
      startTime: examsTable.startTime,
      endTime: examsTable.endTime,
      duration: examsTable.duration,
      venue: examsTable.venue,
      semester: examsTable.semester,
      academicYear: examsTable.academicYear,
      status: examsTable.status,
      instructions: examsTable.instructions,
      createdAt: examsTable.createdAt,
      subjectName: subjectsTable.name,
      subjectCode: subjectsTable.code,
    })
    .from(examsTable)
    .leftJoin(subjectsTable, eq(examsTable.subjectId, subjectsTable.id))
    .where(eq(examsTable.id, Number(req.params.id)));

    if (!exam) { res.status(404).json({ error: "Exam not found" }); return; }
    res.json(exam);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/exams", requireAuth, requirePermission("exams"), async (req, res): Promise<void> => {
  try {
    const { subjectId, departmentId, courseId, type, maxMarks, passMarks, date, startTime, endTime, duration, venue, semester, academicYear, status, instructions } = req.body;
    if (!subjectId || !type || !maxMarks || !date || !semester || !academicYear) {
      res.status(400).json({ error: "subjectId, type, maxMarks, date, semester, and academicYear are required" });
      return;
    }
    const [exam] = await db.insert(examsTable).values({
      subjectId, departmentId: departmentId || null, courseId: courseId || null,
      type, maxMarks, passMarks: passMarks || null, date,
      startTime: startTime || null, endTime: endTime || null,
      duration: duration || null, venue: venue || null,
      semester, academicYear, status: status || "Scheduled",
      instructions: instructions || null,
    }).returning();
    await logActivity("exam_created", `${type} exam scheduled for ${date}`, `Exam ${exam.id}`);
    res.status(201).json(exam);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/exams/:id", requireAuth, requirePermission("exams"), async (req, res): Promise<void> => {
  try {
    const { subjectId, departmentId, courseId, type, maxMarks, passMarks, date, startTime, endTime, duration, venue, semester, academicYear, status, instructions } = req.body;
    const [updated] = await db.update(examsTable).set({
      ...(subjectId && { subjectId }),
      ...(departmentId !== undefined && { departmentId: departmentId || null }),
      ...(courseId !== undefined && { courseId: courseId || null }),
      ...(type && { type }),
      ...(maxMarks && { maxMarks }),
      ...(passMarks !== undefined && { passMarks: passMarks || null }),
      ...(date && { date }),
      ...(startTime !== undefined && { startTime: startTime || null }),
      ...(endTime !== undefined && { endTime: endTime || null }),
      ...(duration !== undefined && { duration: duration || null }),
      ...(venue !== undefined && { venue: venue || null }),
      ...(semester && { semester }),
      ...(academicYear && { academicYear }),
      ...(status && { status }),
      ...(instructions !== undefined && { instructions: instructions || null }),
      updatedAt: new Date(),
    }).where(eq(examsTable.id, Number(req.params.id))).returning();
    if (!updated) { res.status(404).json({ error: "Exam not found" }); return; }
    await logActivity("exam_updated", `Exam ${updated.id} updated`, `Exam ${updated.id}`);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/exams/:id", requireAuth, requirePermission("exams"), async (req, res): Promise<void> => {
  try {
    await db.delete(examResultsTable).where(eq(examResultsTable.examId, Number(req.params.id)));
    const [deleted] = await db.delete(examsTable).where(eq(examsTable.id, Number(req.params.id))).returning();
    if (!deleted) { res.status(404).json({ error: "Exam not found" }); return; }
    await logActivity("exam_deleted", `Exam ${deleted.id} deleted`, `Exam ${deleted.id}`);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/exam-results", requireAuth, requirePermission("exams"), async (req, res): Promise<void> => {
  try {
    const { examId, studentId } = req.query;
    const conditions: any[] = [];
    if (examId) conditions.push(eq(examResultsTable.examId, Number(examId)));
    if (studentId) conditions.push(eq(examResultsTable.studentId, Number(studentId)));

    const results = await db.select({
      id: examResultsTable.id,
      examId: examResultsTable.examId,
      studentId: examResultsTable.studentId,
      marksObtained: examResultsTable.marksObtained,
      grade: examResultsTable.grade,
      status: examResultsTable.status,
      createdAt: examResultsTable.createdAt,
      rollNumber: studentsTable.rollNumber,
      firstName: studentsTable.firstName,
      lastName: studentsTable.lastName,
    })
    .from(examResultsTable)
    .leftJoin(studentsTable, eq(examResultsTable.studentId, studentsTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(examResultsTable.createdAt);

    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/exam-results", requireAuth, requirePermission("exams"), async (req, res): Promise<void> => {
  try {
    const { examId, results: entries } = req.body;
    if (!examId || !entries || !Array.isArray(entries) || entries.length === 0) {
      res.status(400).json({ error: "examId and results array are required" });
      return;
    }

    const [exam] = await db.select().from(examsTable).where(eq(examsTable.id, examId));
    if (!exam) { res.status(404).json({ error: "Exam not found" }); return; }

    const values = entries.map((r: any) => {
      const autoCalc = calculateGrade(r.marksObtained, exam.maxMarks, exam.passMarks);
      return {
        examId,
        studentId: r.studentId,
        marksObtained: r.marksObtained,
        grade: r.grade || autoCalc.grade,
        status: r.status || autoCalc.status,
      };
    });

    await db.delete(examResultsTable).where(eq(examResultsTable.examId, examId));
    const inserted = await db.insert(examResultsTable).values(values).returning();
    await logActivity("exam_results_recorded", `Results recorded for ${inserted.length} students`, `Exam ${examId}`);
    res.status(201).json(inserted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/exam-stats", requireAuth, requirePermission("exams"), async (req, res): Promise<void> => {
  try {
    const allExams = await db.select().from(examsTable);
    const allResults = await db.select().from(examResultsTable);

    const total = allExams.length;
    const scheduled = allExams.filter(e => e.status === "Scheduled").length;
    const ongoing = allExams.filter(e => e.status === "Ongoing").length;
    const completed = allExams.filter(e => e.status === "Completed").length;
    const cancelled = allExams.filter(e => e.status === "Cancelled").length;

    const passCount = allResults.filter(r => r.status === "Pass").length;
    const failCount = allResults.filter(r => r.status === "Fail").length;
    const totalResults = allResults.length;
    const avgPassRate = totalResults > 0 ? Math.round((passCount / totalResults) * 100) : 0;

    const typeBreakdown: Record<string, number> = {};
    allExams.forEach(e => { typeBreakdown[e.type] = (typeBreakdown[e.type] || 0) + 1; });

    res.json({
      total, scheduled, ongoing, completed, cancelled,
      totalResults, passCount, failCount, avgPassRate,
      typeBreakdown,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/exam-stats/:id", requireAuth, requirePermission("exams"), async (req, res): Promise<void> => {
  try {
    const examId = Number(req.params.id);
    const [exam] = await db.select().from(examsTable).where(eq(examsTable.id, examId));
    if (!exam) { res.status(404).json({ error: "Exam not found" }); return; }

    const results = await db.select().from(examResultsTable).where(eq(examResultsTable.examId, examId));
    const total = results.length;
    const passCount = results.filter(r => r.status === "Pass").length;
    const failCount = results.filter(r => r.status === "Fail").length;
    const absentCount = results.filter(r => r.status === "Absent").length;
    const marks = results.filter(r => r.status !== "Absent").map(r => r.marksObtained);
    const highest = marks.length > 0 ? Math.max(...marks) : 0;
    const lowest = marks.length > 0 ? Math.min(...marks) : 0;
    const average = marks.length > 0 ? Math.round((marks.reduce((a, b) => a + b, 0) / marks.length) * 100) / 100 : 0;
    const passRate = total > 0 ? Math.round((passCount / total) * 100) : 0;

    const gradeDistribution: Record<string, number> = {};
    results.forEach(r => {
      if (r.grade) gradeDistribution[r.grade] = (gradeDistribution[r.grade] || 0) + 1;
    });

    const markRanges = { "0-40": 0, "41-50": 0, "51-60": 0, "61-70": 0, "71-80": 0, "81-90": 0, "91-100": 0 };
    results.filter(r => r.status !== "Absent").forEach(r => {
      const pct = Math.round((r.marksObtained / exam.maxMarks) * 100);
      if (pct <= 40) markRanges["0-40"]++;
      else if (pct <= 50) markRanges["41-50"]++;
      else if (pct <= 60) markRanges["51-60"]++;
      else if (pct <= 70) markRanges["61-70"]++;
      else if (pct <= 80) markRanges["71-80"]++;
      else if (pct <= 90) markRanges["81-90"]++;
      else markRanges["91-100"]++;
    });

    res.json({
      total, passCount, failCount, absentCount,
      highest, lowest, average, passRate,
      gradeDistribution, markRanges,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/exam-eligible-students/:examId", requireAuth, requirePermission("exams"), async (req, res): Promise<void> => {
  try {
    const examId = Number(req.params.examId);
    const [exam] = await db.select().from(examsTable).where(eq(examsTable.id, examId));
    if (!exam) { res.status(404).json({ error: "Exam not found" }); return; }

    const conditions: any[] = [eq(studentsTable.status, "Active")];
    if (exam.departmentId) conditions.push(eq(studentsTable.departmentId, exam.departmentId));
    if (exam.courseId) conditions.push(eq(studentsTable.courseId, exam.courseId));
    if (exam.semester) conditions.push(eq(studentsTable.semester, exam.semester));

    const students = await db.select({
      id: studentsTable.id,
      rollNumber: studentsTable.rollNumber,
      firstName: studentsTable.firstName,
      lastName: studentsTable.lastName,
      departmentId: studentsTable.departmentId,
      semester: studentsTable.semester,
    })
    .from(studentsTable)
    .where(and(...conditions))
    .orderBy(studentsTable.rollNumber);

    res.json(students);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
