import { Router, type IRouter } from "express";
import { db, companiesTable, placementDrivesTable, placementApplicationsTable, trainingProgramsTable, trainingEnrollmentsTable, studentsTable, departmentsTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth, requirePermission } from "../middleware/auth";
import { logActivity } from "../lib/activity";
import { getUserScope } from "../lib/scopeFilter";

const router: IRouter = Router();

router.get("/companies", requireAuth, async (_req, res): Promise<void> => {
  try {
    const companies = await db.select().from(companiesTable).orderBy(desc(companiesTable.createdAt));
    res.json(companies);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/companies", requireAuth, requirePermission("placements"), async (req, res): Promise<void> => {
  try {
    const { name, industry, website, contactPerson, contactEmail, contactPhone, address } = req.body;
    if (!name || !industry) { res.status(400).json({ error: "Name and industry required" }); return; }
    const [company] = await db.insert(companiesTable).values({ name, industry, website, contactPerson, contactEmail, contactPhone, address }).returning();
    await logActivity("company_added", `Company added: ${name}`, String(company.id));
    res.json(company);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.patch("/companies/:id", requireAuth, requirePermission("placements"), async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const [company] = await db.update(companiesTable).set(req.body).where(eq(companiesTable.id, id)).returning();
    if (!company) { res.status(404).json({ error: "Not found" }); return; }
    res.json(company);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete("/companies/:id", requireAuth, requirePermission("placements"), async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const [c] = await db.delete(companiesTable).where(eq(companiesTable.id, id)).returning();
    if (!c) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/placement-drives", requireAuth, async (_req, res): Promise<void> => {
  try {
    const drives = await db.select().from(placementDrivesTable).orderBy(desc(placementDrivesTable.createdAt));
    const companies = await db.select().from(companiesTable);
    const enriched = drives.map(d => ({
      ...d,
      companyName: companies.find(c => c.id === d.companyId)?.name || "-",
    }));
    res.json(enriched);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/placement-drives", requireAuth, requirePermission("placements"), async (req, res): Promise<void> => {
  try {
    const { companyId, title, driveDate, packageMin, packageMax, eligibilityCriteria, rolesOffered, location, driveType, departmentsEligible, description } = req.body;
    if (!companyId || !title || !driveDate) { res.status(400).json({ error: "Company, title, and date required" }); return; }
    const [drive] = await db.insert(placementDrivesTable).values({
      companyId: Number(companyId), title, driveDate, packageMin, packageMax, eligibilityCriteria, rolesOffered, location, driveType: driveType || "On-Campus", departmentsEligible, description,
    }).returning();
    await logActivity("placement_drive_created", `Placement drive: ${title}`, String(drive.id));
    res.json(drive);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.patch("/placement-drives/:id", requireAuth, requirePermission("placements"), async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const [drive] = await db.update(placementDrivesTable).set(req.body).where(eq(placementDrivesTable.id, id)).returning();
    if (!drive) { res.status(404).json({ error: "Not found" }); return; }
    res.json(drive);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/placement-applications", requireAuth, async (req, res): Promise<void> => {
  try {
    const scope = getUserScope(req);
    const { driveId } = req.query;
    const conditions: any[] = [];

    if (scope.isStudent && scope.studentRecordId) {
      conditions.push(eq(placementApplicationsTable.studentId, scope.studentRecordId));
    }
    if (driveId) conditions.push(eq(placementApplicationsTable.driveId, Number(driveId)));
    const apps = conditions.length > 0
      ? await db.select().from(placementApplicationsTable).where(and(...conditions)).orderBy(desc(placementApplicationsTable.appliedAt))
      : await db.select().from(placementApplicationsTable).orderBy(desc(placementApplicationsTable.appliedAt));
    const students = await db.select().from(studentsTable);
    const drives = await db.select().from(placementDrivesTable);
    const enriched = apps.map(a => ({
      ...a,
      studentName: (() => { const s = students.find(s => s.id === a.studentId); return s ? `${s.firstName} ${s.lastName}` : "-"; })(),
      rollNumber: students.find(s => s.id === a.studentId)?.rollNumber || "-",
      driveTitle: drives.find(d => d.id === a.driveId)?.title || "-",
    }));
    res.json(enriched);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/placement-applications", requireAuth, requirePermission("placements"), async (req, res): Promise<void> => {
  try {
    const { driveId, studentId } = req.body;
    if (!driveId || !studentId) { res.status(400).json({ error: "Drive and student required" }); return; }
    const existing = await db.select().from(placementApplicationsTable).where(
      and(eq(placementApplicationsTable.driveId, Number(driveId)), eq(placementApplicationsTable.studentId, Number(studentId)))
    );
    if (existing.length > 0) { res.status(400).json({ error: "Student already applied" }); return; }
    const [app] = await db.insert(placementApplicationsTable).values({ driveId: Number(driveId), studentId: Number(studentId) }).returning();
    res.json(app);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.patch("/placement-applications/:id", requireAuth, requirePermission("placements"), async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const [app] = await db.update(placementApplicationsTable).set(req.body).where(eq(placementApplicationsTable.id, id)).returning();
    if (!app) { res.status(404).json({ error: "Not found" }); return; }
    res.json(app);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/training-programs", requireAuth, async (_req, res): Promise<void> => {
  try {
    const programs = await db.select().from(trainingProgramsTable).orderBy(desc(trainingProgramsTable.createdAt));
    res.json(programs);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/training-programs", requireAuth, requirePermission("placements"), async (req, res): Promise<void> => {
  try {
    const { title, trainer, trainerOrg, startDate, endDate, duration, type, mode, departmentId, maxParticipants, description } = req.body;
    if (!title || !trainer || !startDate) { res.status(400).json({ error: "Title, trainer, and start date required" }); return; }
    const [program] = await db.insert(trainingProgramsTable).values({
      title, trainer, trainerOrg, startDate, endDate, duration, type: type || "Technical", mode: mode || "Offline", departmentId: departmentId ? Number(departmentId) : null, maxParticipants: maxParticipants ? Number(maxParticipants) : null, description,
    }).returning();
    await logActivity("training_program_created", `Training program: ${title}`, String(program.id));
    res.json(program);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.patch("/training-programs/:id", requireAuth, requirePermission("placements"), async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const [program] = await db.update(trainingProgramsTable).set(req.body).where(eq(trainingProgramsTable.id, id)).returning();
    if (!program) { res.status(404).json({ error: "Not found" }); return; }
    res.json(program);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/training-enrollments", requireAuth, async (req, res): Promise<void> => {
  try {
    const scope = getUserScope(req);
    const { programId } = req.query;
    const conditions: any[] = [];

    if (scope.isStudent && scope.studentRecordId) {
      conditions.push(eq(trainingEnrollmentsTable.studentId, scope.studentRecordId));
    }
    if (programId) conditions.push(eq(trainingEnrollmentsTable.programId, Number(programId)));
    const enrollments = conditions.length > 0
      ? await db.select().from(trainingEnrollmentsTable).where(and(...conditions)).orderBy(desc(trainingEnrollmentsTable.enrolledAt))
      : await db.select().from(trainingEnrollmentsTable).orderBy(desc(trainingEnrollmentsTable.enrolledAt));
    const students = await db.select().from(studentsTable);
    const enriched = enrollments.map(e => ({
      ...e,
      studentName: (() => { const s = students.find(s => s.id === e.studentId); return s ? `${s.firstName} ${s.lastName}` : "-"; })(),
      rollNumber: students.find(s => s.id === e.studentId)?.rollNumber || "-",
    }));
    res.json(enriched);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post("/training-enrollments", requireAuth, requirePermission("placements"), async (req, res): Promise<void> => {
  try {
    const { programId, studentId } = req.body;
    if (!programId || !studentId) { res.status(400).json({ error: "Program and student required" }); return; }
    const [enrollment] = await db.insert(trainingEnrollmentsTable).values({ programId: Number(programId), studentId: Number(studentId) }).returning();
    res.json(enrollment);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.patch("/training-enrollments/:id", requireAuth, requirePermission("placements"), async (req, res): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const [enrollment] = await db.update(trainingEnrollmentsTable).set(req.body).where(eq(trainingEnrollmentsTable.id, id)).returning();
    if (!enrollment) { res.status(404).json({ error: "Not found" }); return; }
    res.json(enrollment);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get("/placement-stats", requireAuth, async (_req, res): Promise<void> => {
  try {
    const companies = await db.select().from(companiesTable);
    const drives = await db.select().from(placementDrivesTable);
    const apps = await db.select().from(placementApplicationsTable);
    const trainings = await db.select().from(trainingProgramsTable);
    const placed = apps.filter(a => a.status === "Placed");
    const totalPackage = placed.reduce((sum, a) => sum + Number(a.packageOffered || 0), 0);
    res.json({
      totalCompanies: companies.filter(c => c.status === "Active").length,
      totalDrives: drives.length,
      upcomingDrives: drives.filter(d => d.status === "Upcoming").length,
      totalApplications: apps.length,
      placed: placed.length,
      avgPackage: placed.length > 0 ? (totalPackage / placed.length).toFixed(2) : "0",
      highestPackage: placed.length > 0 ? Math.max(...placed.map(a => Number(a.packageOffered || 0))).toFixed(2) : "0",
      trainingPrograms: trainings.length,
      activeTrainings: trainings.filter(t => t.status === "Ongoing").length,
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;
