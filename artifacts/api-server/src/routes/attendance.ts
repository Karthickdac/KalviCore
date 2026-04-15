import { Router, type IRouter } from "express";
import { eq, and, sql, type SQL } from "drizzle-orm";
import { db, attendanceTable, subjectsTable } from "@workspace/db";
import {
  MarkAttendanceBody,
  ListAttendanceResponse,
  ListAttendanceQueryParams,
  GetStudentAttendanceSummaryParams,
  GetStudentAttendanceSummaryResponse,
} from "@workspace/api-zod";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/attendance", async (req, res): Promise<void> => {
  const query = ListAttendanceQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const conditions: SQL[] = [];
  if (query.data.studentId) conditions.push(eq(attendanceTable.studentId, query.data.studentId));
  if (query.data.subjectId) conditions.push(eq(attendanceTable.subjectId, query.data.subjectId));
  if (query.data.date) conditions.push(eq(attendanceTable.date, String(query.data.date)));

  const records = conditions.length > 0
    ? await db.select().from(attendanceTable).where(and(...conditions)).orderBy(attendanceTable.date)
    : await db.select().from(attendanceTable).orderBy(attendanceTable.date).limit(500);
  res.json(ListAttendanceResponse.parse(records));
});

router.post("/attendance", async (req, res): Promise<void> => {
  const parsed = MarkAttendanceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const values = parsed.data.records.map(r => ({
    studentId: r.studentId,
    subjectId: parsed.data.subjectId,
    date: parsed.data.date,
    status: r.status,
    markedBy: null,
  }));
  const inserted = await db.insert(attendanceTable).values(values).returning();
  await logActivity("attendance_marked", `Attendance marked for ${inserted.length} students`, `Subject ${parsed.data.subjectId}`);
  res.status(201).json(ListAttendanceResponse.parse(inserted));
});

router.get("/attendance/student/:studentId/summary", async (req, res): Promise<void> => {
  const params = GetStudentAttendanceSummaryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const summary = await db
    .select({
      subjectId: attendanceTable.subjectId,
      subjectName: subjectsTable.name,
      totalClasses: sql<number>`count(*)::int`,
      present: sql<number>`count(*) filter (where ${attendanceTable.status} = 'Present')::int`,
      absent: sql<number>`count(*) filter (where ${attendanceTable.status} = 'Absent')::int`,
      percentage: sql<number>`round((count(*) filter (where ${attendanceTable.status} = 'Present')::numeric / nullif(count(*), 0)) * 100, 2)`,
    })
    .from(attendanceTable)
    .innerJoin(subjectsTable, eq(attendanceTable.subjectId, subjectsTable.id))
    .where(eq(attendanceTable.studentId, params.data.studentId))
    .groupBy(attendanceTable.subjectId, subjectsTable.name);

  res.json(GetStudentAttendanceSummaryResponse.parse(summary));
});

export default router;
