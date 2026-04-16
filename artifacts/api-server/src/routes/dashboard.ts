import { Router, type IRouter } from "express";
import { sql, eq, desc, and, inArray } from "drizzle-orm";
import {
  db,
  studentsTable,
  staffTable,
  departmentsTable,
  coursesTable,
  feePaymentsTable,
  feeStructuresTable,
  attendanceTable,
  activityLogTable,
} from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetRecentActivityResponse,
  GetRecentActivityQueryParams,
  GetDepartmentStatsResponse,
  GetFeeOverviewResponse,
  GetAttendanceOverviewResponse,
} from "@workspace/api-zod";
import { getUserScope } from "../lib/scopeFilter";
import { requireAuth } from "../middleware/auth";

const router: IRouter = Router();

router.get("/dashboard/summary", requireAuth, async (req, res): Promise<void> => {
  const scope = getUserScope(req);
  const deptFilter = scope && !scope.isAdmin && scope.departmentId ? scope.departmentId : null;

  const studentWhere = deptFilter ? eq(studentsTable.departmentId, deptFilter) : undefined;
  const staffWhere = deptFilter ? eq(staffTable.departmentId, deptFilter) : undefined;

  const [studentCount] = await db.select({ count: sql<number>`count(*)::int` }).from(studentsTable).where(studentWhere);
  const [staffCount] = await db.select({ count: sql<number>`count(*)::int` }).from(staffTable).where(staffWhere);
  const [deptCount] = deptFilter
    ? [{ count: 1 }]
    : await db.select({ count: sql<number>`count(*)::int` }).from(departmentsTable);
  const [courseCount] = await db.select({ count: sql<number>`count(*)::int` }).from(coursesTable);
  const [activeCount] = deptFilter
    ? await db.select({ count: sql<number>`count(*)::int` }).from(studentsTable).where(and(eq(studentsTable.status, "Active"), eq(studentsTable.departmentId, deptFilter)))
    : await db.select({ count: sql<number>`count(*)::int` }).from(studentsTable).where(eq(studentsTable.status, "Active"));

  let feeCollectedTotal = 0;
  let feeDemandTotal = 0;
  if (deptFilter) {
    const deptStudentIds = (await db.select({ id: studentsTable.id }).from(studentsTable).where(eq(studentsTable.departmentId, deptFilter))).map(s => s.id);
    if (deptStudentIds.length > 0) {
      const [fc] = await db.select({ total: sql<number>`coalesce(sum(amount_paid::numeric), 0)::float` }).from(feePaymentsTable).where(inArray(feePaymentsTable.studentId, deptStudentIds));
      feeCollectedTotal = fc.total;
    }
  } else {
    const [fc] = await db.select({ total: sql<number>`coalesce(sum(amount_paid::numeric), 0)::float` }).from(feePaymentsTable);
    feeCollectedTotal = fc.total;
  }
  const [feeDemand] = await db.select({ total: sql<number>`coalesce(sum(total_fee::numeric), 0)::float` }).from(feeStructuresTable);
  feeDemandTotal = feeDemand.total;

  let attTotal = 0, attPresent = 0;
  if (deptFilter) {
    const deptStudentIds = (await db.select({ id: studentsTable.id }).from(studentsTable).where(eq(studentsTable.departmentId, deptFilter))).map(s => s.id);
    if (deptStudentIds.length > 0) {
      const [attStats] = await db.select({
        total: sql<number>`count(*)::int`,
        present: sql<number>`count(*) filter (where ${attendanceTable.status} = 'Present')::int`,
      }).from(attendanceTable).where(inArray(attendanceTable.studentId, deptStudentIds));
      attTotal = attStats.total;
      attPresent = attStats.present;
    }
  } else {
    const [attStats] = await db.select({
      total: sql<number>`count(*)::int`,
      present: sql<number>`count(*) filter (where ${attendanceTable.status} = 'Present')::int`,
    }).from(attendanceTable);
    attTotal = attStats.total;
    attPresent = attStats.present;
  }

  const avgAttendance = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 0;

  res.json(GetDashboardSummaryResponse.parse({
    totalStudents: studentCount.count,
    totalStaff: staffCount.count,
    totalDepartments: deptCount.count,
    totalCourses: courseCount.count,
    totalFeeCollected: feeCollectedTotal,
    totalFeePending: feeDemandTotal - feeCollectedTotal,
    averageAttendance: avgAttendance,
    activeStudents: activeCount.count,
  }));
});

router.get("/dashboard/recent-activity", async (req, res): Promise<void> => {
  const query = GetRecentActivityQueryParams.safeParse(req.query);
  const limit = query.success ? (query.data.limit ?? 10) : 10;
  const activities = await db.select().from(activityLogTable).orderBy(desc(activityLogTable.createdAt)).limit(limit);
  res.json(GetRecentActivityResponse.parse(activities));
});

router.get("/dashboard/department-stats", async (_req, res): Promise<void> => {
  const departments = await db.select().from(departmentsTable);
  const stats = await Promise.all(departments.map(async (dept) => {
    const [studentCount] = await db.select({ count: sql<number>`count(*)::int` }).from(studentsTable).where(eq(studentsTable.departmentId, dept.id));
    const [staffCount] = await db.select({ count: sql<number>`count(*)::int` }).from(staffTable).where(eq(staffTable.departmentId, dept.id));
    return {
      departmentId: dept.id,
      departmentName: dept.name,
      studentCount: studentCount.count,
      staffCount: staffCount.count,
    };
  }));
  res.json(GetDepartmentStatsResponse.parse(stats));
});

router.get("/dashboard/fee-overview", async (_req, res): Promise<void> => {
  const [feeDemand] = await db.select({ total: sql<number>`coalesce(sum(total_fee::numeric), 0)::float` }).from(feeStructuresTable);
  const [feeCollected] = await db.select({ total: sql<number>`coalesce(sum(amount_paid::numeric), 0)::float` }).from(feePaymentsTable);

  const totalDemand = feeDemand.total;
  const totalCollected = feeCollected.total;
  const totalPending = totalDemand - totalCollected;
  const collectionRate = totalDemand > 0 ? Math.round((totalCollected / totalDemand) * 100) : 0;

  const monthlyRaw = await db.select({
    month: sql<string>`to_char(created_at, 'YYYY-MM')`,
    amount: sql<number>`coalesce(sum(amount_paid::numeric), 0)::float`,
  }).from(feePaymentsTable).groupBy(sql`to_char(created_at, 'YYYY-MM')`).orderBy(sql`to_char(created_at, 'YYYY-MM')`);

  res.json(GetFeeOverviewResponse.parse({
    totalDemand,
    totalCollected,
    totalPending,
    collectionRate,
    monthlyCollections: monthlyRaw,
  }));
});

router.get("/dashboard/attendance-overview", async (_req, res): Promise<void> => {
  const [attStats] = await db.select({
    total: sql<number>`count(*)::int`,
    present: sql<number>`count(*) filter (where ${attendanceTable.status} = 'Present')::int`,
    absent: sql<number>`count(*) filter (where ${attendanceTable.status} = 'Absent')::int`,
  }).from(attendanceTable);

  const avgPercentage = attStats.total > 0 ? Math.round((attStats.present / attStats.total) * 100) : 0;

  const departments = await db.select().from(departmentsTable);
  const deptWise = await Promise.all(departments.map(async (dept) => {
    const [stats] = await db.select({
      total: sql<number>`count(*)::int`,
      present: sql<number>`count(*) filter (where ${attendanceTable.status} = 'Present')::int`,
    }).from(attendanceTable)
      .innerJoin(studentsTable, eq(attendanceTable.studentId, studentsTable.id))
      .where(eq(studentsTable.departmentId, dept.id));
    return {
      departmentName: dept.name,
      percentage: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0,
    };
  }));

  res.json(GetAttendanceOverviewResponse.parse({
    averagePercentage: avgPercentage,
    totalPresent: attStats.present,
    totalAbsent: attStats.absent,
    totalClasses: attStats.total,
    departmentWise: deptWise,
  }));
});

router.get("/dashboard/student-summary", requireAuth, async (req, res): Promise<void> => {
  const scope = getUserScope(req);
  if (!scope?.isStudent || !scope.studentRecordId) {
    res.status(403).json({ error: "Student access only" });
    return;
  }
  const sid = scope.studentRecordId;
  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, sid));
  if (!student) { res.status(404).json({ error: "Student not found" }); return; }

  const [attStats] = await db.select({
    total: sql<number>`count(*)::int`,
    present: sql<number>`count(*) filter (where ${attendanceTable.status} = 'Present')::int`,
  }).from(attendanceTable).where(eq(attendanceTable.studentId, sid));

  const [feeStats] = await db.select({
    totalPaid: sql<number>`coalesce(sum(amount_paid::numeric), 0)::float`,
    count: sql<number>`count(*)::int`,
  }).from(feePaymentsTable).where(eq(feePaymentsTable.studentId, sid));

  const deptName = student.departmentId
    ? (await db.select({ name: departmentsTable.name }).from(departmentsTable).where(eq(departmentsTable.id, student.departmentId)))[0]?.name || "-"
    : "-";

  const courseName = student.courseId
    ? (await db.select({ name: coursesTable.name }).from(coursesTable).where(eq(coursesTable.id, student.courseId)))[0]?.name || "-"
    : "-";

  res.json({
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      rollNumber: student.rollNumber,
      semester: student.semester,
      departmentName: deptName,
      courseName,
      admissionDate: student.admissionDate,
      email: student.email,
      phone: student.phone,
      bloodGroup: student.bloodGroup,
      status: student.status,
    },
    attendance: {
      total: attStats.total,
      present: attStats.present,
      percentage: attStats.total > 0 ? Math.round((attStats.present / attStats.total) * 100) : 0,
    },
    fees: {
      totalPaid: feeStats.totalPaid,
      paymentCount: feeStats.count,
    },
  });
});

export default router;
