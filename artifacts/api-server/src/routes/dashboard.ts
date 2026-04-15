import { Router, type IRouter } from "express";
import { sql, eq, desc } from "drizzle-orm";
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

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [studentCount] = await db.select({ count: sql<number>`count(*)::int` }).from(studentsTable);
  const [staffCount] = await db.select({ count: sql<number>`count(*)::int` }).from(staffTable);
  const [deptCount] = await db.select({ count: sql<number>`count(*)::int` }).from(departmentsTable);
  const [courseCount] = await db.select({ count: sql<number>`count(*)::int` }).from(coursesTable);
  const [activeCount] = await db.select({ count: sql<number>`count(*)::int` }).from(studentsTable).where(eq(studentsTable.status, "Active"));

  const [feeCollected] = await db.select({ total: sql<number>`coalesce(sum(amount_paid::numeric), 0)::float` }).from(feePaymentsTable);
  const [feeDemand] = await db.select({ total: sql<number>`coalesce(sum(total_fee::numeric), 0)::float` }).from(feeStructuresTable);

  const [attStats] = await db.select({
    total: sql<number>`count(*)::int`,
    present: sql<number>`count(*) filter (where ${attendanceTable.status} = 'Present')::int`,
  }).from(attendanceTable);

  const avgAttendance = attStats.total > 0 ? Math.round((attStats.present / attStats.total) * 100) : 0;

  res.json(GetDashboardSummaryResponse.parse({
    totalStudents: studentCount.count,
    totalStaff: staffCount.count,
    totalDepartments: deptCount.count,
    totalCourses: courseCount.count,
    totalFeeCollected: feeCollected.total,
    totalFeePending: feeDemand.total - feeCollected.total,
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

export default router;
