import { Router, type IRouter } from "express";
import { db, examResultsTable, examsTable, subjectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const GRADE_POINTS: Record<string, number> = {
  "O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "P": 4, "F": 0, "AB": 0
};

router.get("/cgpa/:studentId", async (req, res): Promise<void> => {
  const studentId = Number(req.params.studentId);
  const results = await db.select({
    examId: examResultsTable.examId,
    subjectId: examResultsTable.subjectId,
    marksObtained: examResultsTable.marksObtained,
    grade: examResultsTable.grade,
    status: examResultsTable.status,
    examName: examsTable.name,
    examType: examsTable.examType,
    semester: examsTable.semester,
    subjectName: subjectsTable.name,
    credits: subjectsTable.credits,
  })
    .from(examResultsTable)
    .innerJoin(examsTable, eq(examResultsTable.examId, examsTable.id))
    .innerJoin(subjectsTable, eq(examResultsTable.subjectId, subjectsTable.id))
    .where(eq(examResultsTable.studentId, studentId));

  const bySemester: Record<number, { subjects: any[]; totalCredits: number; weightedPoints: number; gpa: number }> = {};
  results.forEach(r => {
    const sem = r.semester;
    if (!bySemester[sem]) bySemester[sem] = { subjects: [], totalCredits: 0, weightedPoints: 0, gpa: 0 };
    const credits = Number(r.credits || 3);
    const gp = GRADE_POINTS[r.grade || "F"] || 0;
    bySemester[sem].subjects.push({ ...r, credits, gradePoint: gp });
    bySemester[sem].totalCredits += credits;
    bySemester[sem].weightedPoints += gp * credits;
  });

  let totalCredits = 0, totalWeighted = 0;
  Object.keys(bySemester).forEach(sem => {
    const s = bySemester[Number(sem)];
    s.gpa = s.totalCredits > 0 ? Number((s.weightedPoints / s.totalCredits).toFixed(2)) : 0;
    totalCredits += s.totalCredits;
    totalWeighted += s.weightedPoints;
  });

  const cgpa = totalCredits > 0 ? Number((totalWeighted / totalCredits).toFixed(2)) : 0;

  res.json({ studentId, cgpa, totalCredits, semesters: bySemester });
});

export default router;
