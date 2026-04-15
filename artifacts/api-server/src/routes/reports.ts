import { Router, type IRouter } from "express";
import { db, studentsTable, staffTable, departmentsTable, coursesTable, attendanceTable, subjectsTable, feePaymentsTable, feeStructuresTable, examResultsTable, examsTable } from "@workspace/db";
import { eq, sql, and, gte, lte, count, avg, sum } from "drizzle-orm";
import { requireAuth, requirePermission } from "../middleware/auth";

const router: IRouter = Router();

router.get("/reports/students", requireAuth, requirePermission("reports"), async (req, res): Promise<void> => {
  const { departmentId, courseId, year, status, community, admissionType } = req.query;
  let conditions: any[] = [];
  if (departmentId) conditions.push(eq(studentsTable.departmentId, Number(departmentId)));
  if (courseId) conditions.push(eq(studentsTable.courseId, Number(courseId)));
  if (year) conditions.push(eq(studentsTable.currentYear, Number(year)));
  if (status) conditions.push(eq(studentsTable.status, String(status)));
  if (community) conditions.push(eq(studentsTable.community, String(community)));
  if (admissionType) conditions.push(eq(studentsTable.admissionType, String(admissionType)));

  const students = conditions.length > 0
    ? await db.select().from(studentsTable).where(and(...conditions))
    : await db.select().from(studentsTable);

  const summary = {
    total: students.length,
    active: students.filter(s => s.status === "Active").length,
    inactive: students.filter(s => s.status === "Inactive").length,
    byCommunity: students.reduce((acc: Record<string, number>, s) => { acc[s.community || "Unknown"] = (acc[s.community || "Unknown"] || 0) + 1; return acc; }, {}),
    byYear: students.reduce((acc: Record<string, number>, s) => { acc[`Year ${s.currentYear}`] = (acc[`Year ${s.currentYear}`] || 0) + 1; return acc; }, {}),
    byGender: students.reduce((acc: Record<string, number>, s) => { acc[s.gender] = (acc[s.gender] || 0) + 1; return acc; }, {}),
  };

  res.json({ students, summary });
});

router.get("/reports/attendance", requireAuth, requirePermission("reports"), async (req, res): Promise<void> => {
  const { departmentId, subjectId, fromDate, toDate } = req.query;
  let conditions: any[] = [];
  if (subjectId) conditions.push(eq(attendanceTable.subjectId, Number(subjectId)));
  if (fromDate) conditions.push(gte(attendanceTable.date, new Date(String(fromDate))));
  if (toDate) conditions.push(lte(attendanceTable.date, new Date(String(toDate))));

  const records = conditions.length > 0
    ? await db.select().from(attendanceTable).where(and(...conditions))
    : await db.select().from(attendanceTable);

  const totalClasses = records.length;
  const present = records.filter(r => r.status === "Present").length;
  const absent = records.filter(r => r.status === "Absent").length;
  const percentage = totalClasses > 0 ? ((present / totalClasses) * 100).toFixed(2) : "0";

  const byStudent: Record<number, { total: number; present: number; absent: number }> = {};
  records.forEach(r => {
    if (!byStudent[r.studentId]) byStudent[r.studentId] = { total: 0, present: 0, absent: 0 };
    byStudent[r.studentId].total++;
    if (r.status === "Present") byStudent[r.studentId].present++;
    else byStudent[r.studentId].absent++;
  });

  const belowThreshold = Object.entries(byStudent).filter(([_, v]) => (v.present / v.total) * 100 < 75).length;

  res.json({
    summary: { totalClasses, present, absent, percentage, totalStudents: Object.keys(byStudent).length, belowThreshold },
    byStudent,
  });
});

router.get("/reports/fees", requireAuth, requirePermission("reports"), async (req, res): Promise<void> => {
  const { academicYear, departmentId, fromDate, toDate } = req.query;
  let conditions: any[] = [];
  if (academicYear) conditions.push(eq(feePaymentsTable.academicYear, String(academicYear)));
  if (fromDate) conditions.push(gte(feePaymentsTable.paidDate, new Date(String(fromDate))));
  if (toDate) conditions.push(lte(feePaymentsTable.paidDate, new Date(String(toDate))));

  const payments = conditions.length > 0
    ? await db.select().from(feePaymentsTable).where(and(...conditions))
    : await db.select().from(feePaymentsTable);

  const totalCollected = payments.reduce((s, p) => s + Number(p.amount), 0);
  const byMode: Record<string, number> = {};
  const byMonth: Record<string, number> = {};
  payments.forEach(p => {
    byMode[p.paymentMode] = (byMode[p.paymentMode] || 0) + Number(p.amount);
    if (p.paidDate) {
      const m = new Date(p.paidDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
      byMonth[m] = (byMonth[m] || 0) + Number(p.amount);
    }
  });

  res.json({ summary: { totalPayments: payments.length, totalCollected, byMode, byMonth }, payments });
});

router.get("/reports/exams", requireAuth, requirePermission("reports"), async (req, res): Promise<void> => {
  const { examId } = req.query;
  let results;
  if (examId) {
    results = await db.select().from(examResultsTable).where(eq(examResultsTable.examId, Number(examId)));
  } else {
    results = await db.select().from(examResultsTable);
  }

  const totalStudents = new Set(results.map(r => r.studentId)).size;
  const passed = results.filter(r => r.status === "Pass").length;
  const failed = results.filter(r => r.status === "Fail").length;
  const avgMarks = results.length > 0 ? (results.reduce((s, r) => s + Number(r.marksObtained), 0) / results.length).toFixed(2) : "0";

  const byGrade: Record<string, number> = {};
  results.forEach(r => { if (r.grade) byGrade[r.grade] = (byGrade[r.grade] || 0) + 1; });

  res.json({ summary: { totalStudents, totalResults: results.length, passed, failed, passPercentage: results.length > 0 ? ((passed / results.length) * 100).toFixed(2) : "0", avgMarks, byGrade }, results });
});

export default router;
