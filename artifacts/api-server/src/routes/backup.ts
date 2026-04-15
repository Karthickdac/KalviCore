import { Router, type IRouter } from "express";
import { db, studentsTable, staffTable, departmentsTable, coursesTable, subjectsTable, feeStructuresTable, feePaymentsTable, examsTable, examResultsTable, eventsTable, announcementsTable, assetsTable, payrollTable, academicCalendarTable } from "@workspace/db";
import { logActivity } from "../lib/activity";
import { requireAuth, requireRole } from "../middleware/auth";

const router: IRouter = Router();

router.get("/backup/export", requireAuth, requireRole("SuperAdmin", "Admin"), async (_req, res): Promise<void> => {
  try {
    const data: Record<string, any[]> = {};
    data.departments = await db.select().from(departmentsTable);
    data.courses = await db.select().from(coursesTable);
    data.students = await db.select().from(studentsTable);
    data.staff = await db.select().from(staffTable);
    data.subjects = await db.select().from(subjectsTable);
    data.feeStructures = await db.select().from(feeStructuresTable);
    data.feePayments = await db.select().from(feePaymentsTable);
    data.exams = await db.select().from(examsTable);
    data.examResults = await db.select().from(examResultsTable);
    data.events = await db.select().from(eventsTable);
    data.announcements = await db.select().from(announcementsTable);
    data.assets = await db.select().from(assetsTable);
    data.payroll = await db.select().from(payrollTable);
    data.academicCalendar = await db.select().from(academicCalendarTable);

    const stats: Record<string, number> = {};
    Object.entries(data).forEach(([key, val]) => { stats[key] = val.length; });

    await logActivity("backup_export", `Database backup exported: ${Object.values(stats).reduce((a, b) => a + b, 0)} total records`, "");

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename=backup_${new Date().toISOString().split("T")[0]}.json`);
    res.json({ exportedAt: new Date().toISOString(), version: "1.0", stats, data });
  } catch (err: any) {
    res.status(500).json({ error: "Backup failed: " + err.message });
  }
});

router.get("/backup/stats", requireAuth, requireRole("SuperAdmin", "Admin"), async (_req, res): Promise<void> => {
  try {
    const stats: Record<string, number> = {};
    stats.departments = (await db.select().from(departmentsTable)).length;
    stats.courses = (await db.select().from(coursesTable)).length;
    stats.students = (await db.select().from(studentsTable)).length;
    stats.staff = (await db.select().from(staffTable)).length;
    stats.subjects = (await db.select().from(subjectsTable)).length;
    stats.exams = (await db.select().from(examsTable)).length;
    stats.events = (await db.select().from(eventsTable)).length;
    stats.payroll = (await db.select().from(payrollTable)).length;
    res.json({ stats, totalRecords: Object.values(stats).reduce((a, b) => a + b, 0) });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to get stats: " + err.message });
  }
});

export default router;
