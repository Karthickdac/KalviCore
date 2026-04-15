import { Router, type IRouter } from "express";
import { eq, and, sql, desc } from "drizzle-orm";
import { db, attendanceTable, subjectsTable, studentsTable, departmentsTable, coursesTable } from "@workspace/db";
import { requireAuth, requirePermission } from "../middleware/auth";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/attendance", requireAuth, requirePermission("attendance"), async (req, res): Promise<void> => {
  try {
    const { studentId, subjectId, date, departmentId } = req.query;
    const conditions: any[] = [];
    if (studentId) conditions.push(eq(attendanceTable.studentId, Number(studentId)));
    if (subjectId) conditions.push(eq(attendanceTable.subjectId, Number(subjectId)));
    if (date) conditions.push(eq(attendanceTable.date, String(date)));

    let query = db.select({
      id: attendanceTable.id,
      studentId: attendanceTable.studentId,
      subjectId: attendanceTable.subjectId,
      date: attendanceTable.date,
      status: attendanceTable.status,
      createdAt: attendanceTable.createdAt,
      rollNumber: studentsTable.rollNumber,
      firstName: studentsTable.firstName,
      lastName: studentsTable.lastName,
      subjectName: subjectsTable.name,
      subjectCode: subjectsTable.code,
    })
    .from(attendanceTable)
    .leftJoin(studentsTable, eq(attendanceTable.studentId, studentsTable.id))
    .leftJoin(subjectsTable, eq(attendanceTable.subjectId, subjectsTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(attendanceTable.date))
    .limit(500);

    res.json(await query);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/attendance/check", requireAuth, requirePermission("attendance"), async (req, res): Promise<void> => {
  try {
    const { subjectId, date } = req.query;
    if (!subjectId || !date) { res.json({ exists: false, records: [] }); return; }
    const existing = await db.select({
      id: attendanceTable.id,
      studentId: attendanceTable.studentId,
      status: attendanceTable.status,
    })
    .from(attendanceTable)
    .where(and(eq(attendanceTable.subjectId, Number(subjectId)), eq(attendanceTable.date, String(date))));
    res.json({ exists: existing.length > 0, records: existing });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/attendance", requireAuth, requirePermission("attendance"), async (req, res): Promise<void> => {
  try {
    const { subjectId, date, records } = req.body;
    if (!subjectId || !date || !records || !Array.isArray(records) || records.length === 0) {
      res.status(400).json({ error: "subjectId, date, and records array are required" });
      return;
    }

    await db.delete(attendanceTable).where(
      and(eq(attendanceTable.subjectId, subjectId), eq(attendanceTable.date, date))
    );

    const values = records.map((r: any) => ({
      studentId: r.studentId,
      subjectId,
      date,
      status: r.status,
      markedBy: null,
    }));
    const inserted = await db.insert(attendanceTable).values(values).returning();
    await logActivity("attendance_marked", `Attendance marked for ${inserted.length} students`, `Subject ${subjectId}`);
    res.status(201).json(inserted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/attendance/students-for-subject/:subjectId", requireAuth, requirePermission("attendance"), async (req, res): Promise<void> => {
  try {
    const subjectId = Number(req.params.subjectId);
    const [subject] = await db.select({
      id: subjectsTable.id,
      name: subjectsTable.name,
      code: subjectsTable.code,
      courseId: subjectsTable.courseId,
      semester: subjectsTable.semester,
    }).from(subjectsTable).where(eq(subjectsTable.id, subjectId));

    if (!subject) { res.status(404).json({ error: "Subject not found" }); return; }

    let courseInfo = null;
    if (subject.courseId) {
      const [c] = await db.select().from(coursesTable).where(eq(coursesTable.id, subject.courseId));
      courseInfo = c || null;
    }

    const conditions: any[] = [eq(studentsTable.status, "Active")];
    if (courseInfo?.departmentId) conditions.push(eq(studentsTable.departmentId, courseInfo.departmentId));
    if (subject.semester) conditions.push(eq(studentsTable.semester, subject.semester));

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

    res.json({ subject, course: courseInfo, students });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/attendance/student/:studentId/summary", requireAuth, requirePermission("attendance"), async (req, res): Promise<void> => {
  try {
    const studentId = Number(req.params.studentId);
    const summary = await db
      .select({
        subjectId: attendanceTable.subjectId,
        subjectName: subjectsTable.name,
        subjectCode: subjectsTable.code,
        totalClasses: sql<number>`count(*)::int`,
        present: sql<number>`count(*) filter (where ${attendanceTable.status} = 'Present')::int`,
        absent: sql<number>`count(*) filter (where ${attendanceTable.status} = 'Absent')::int`,
        percentage: sql<number>`round((count(*) filter (where ${attendanceTable.status} = 'Present')::numeric / nullif(count(*), 0)) * 100)`,
      })
      .from(attendanceTable)
      .innerJoin(subjectsTable, eq(attendanceTable.subjectId, subjectsTable.id))
      .where(eq(attendanceTable.studentId, studentId))
      .groupBy(attendanceTable.subjectId, subjectsTable.name, subjectsTable.code);

    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/attendance/overview", requireAuth, requirePermission("attendance"), async (req, res): Promise<void> => {
  try {
    const { departmentId } = req.query;

    const totalRecords = await db.select({ count: sql<number>`count(*)::int` }).from(attendanceTable);
    const presentCount = await db.select({ count: sql<number>`count(*)::int` }).from(attendanceTable).where(eq(attendanceTable.status, "Present"));
    const absentCount = await db.select({ count: sql<number>`count(*)::int` }).from(attendanceTable).where(eq(attendanceTable.status, "Absent"));

    const total = totalRecords[0]?.count || 0;
    const present = presentCount[0]?.count || 0;
    const absent = absentCount[0]?.count || 0;
    const avgPercentage = total > 0 ? Math.round((present / total) * 100) : 0;

    const today = new Date().toISOString().split("T")[0];
    const todayRecords = await db.select({ count: sql<number>`count(*)::int` }).from(attendanceTable).where(eq(attendanceTable.date, today));
    const todayPresent = await db.select({ count: sql<number>`count(*)::int` }).from(attendanceTable).where(and(eq(attendanceTable.date, today), eq(attendanceTable.status, "Present")));

    const belowThreshold = await db
      .select({
        studentId: attendanceTable.studentId,
        pct: sql<number>`round((count(*) filter (where ${attendanceTable.status} = 'Present')::numeric / nullif(count(*), 0)) * 100)`,
      })
      .from(attendanceTable)
      .groupBy(attendanceTable.studentId)
      .having(sql`round((count(*) filter (where ${attendanceTable.status} = 'Present')::numeric / nullif(count(*), 0)) * 100) < 75`);

    res.json({
      totalRecords: total,
      totalPresent: present,
      totalAbsent: absent,
      avgPercentage,
      todayMarked: todayRecords[0]?.count || 0,
      todayPresent: todayPresent[0]?.count || 0,
      belowThresholdCount: belowThreshold.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/attendance/department-wise", requireAuth, requirePermission("attendance"), async (req, res): Promise<void> => {
  try {
    const deptStats = await db
      .select({
        departmentId: studentsTable.departmentId,
        departmentName: departmentsTable.name,
        totalRecords: sql<number>`count(${attendanceTable.id})::int`,
        presentCount: sql<number>`count(*) filter (where ${attendanceTable.status} = 'Present')::int`,
        percentage: sql<number>`round((count(*) filter (where ${attendanceTable.status} = 'Present')::numeric / nullif(count(*), 0)) * 100)`,
      })
      .from(attendanceTable)
      .innerJoin(studentsTable, eq(attendanceTable.studentId, studentsTable.id))
      .innerJoin(departmentsTable, eq(studentsTable.departmentId, departmentsTable.id))
      .groupBy(studentsTable.departmentId, departmentsTable.name)
      .orderBy(departmentsTable.name);

    res.json(deptStats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
