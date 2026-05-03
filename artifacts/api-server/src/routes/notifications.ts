import { Router, type IRouter } from "express";
import { db, notificationsTable, studentsTable, staffTable, departmentsTable, coursesTable } from "@workspace/db";
import { eq, desc, and, sql, inArray } from "drizzle-orm";
import { requireAuth, requirePermission } from "../middleware/auth";
import { logActivity } from "../lib/activity";
import { getUserScope } from "../lib/scopeFilter";
import { getInstitutionInfo } from "../lib/institutionSettings";

const router: IRouter = Router();

// Replaces {{var}} placeholders with values from ctx. Unmatched variables are left as-is
// so a sender immediately notices missing data instead of shipping silently broken text.
function renderTemplate(text: string, ctx: Record<string, string | number | null | undefined>): string {
  if (!text) return text;
  return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    const v = ctx[key];
    return v === undefined || v === null || v === "" ? match : String(v);
  });
}

function formatDate(d = new Date()): string {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

router.get("/notifications", requireAuth, requirePermission("notifications"), async (req, res): Promise<void> => {
  try {
    const scope = getUserScope(req);
    const { channel, status } = req.query;
    const conditions: any[] = [];

    if (scope.isStudent) {
      conditions.push(eq(notificationsTable.type, "Student"));
    } else if (scope.isFaculty || scope.isStaff) {
      conditions.push(eq(notificationsTable.type, "Staff"));
    }

    if (channel && channel !== "all") conditions.push(eq(notificationsTable.channel, String(channel)));
    if (status && status !== "all") conditions.push(eq(notificationsTable.status, String(status)));
    const notifications = conditions.length > 0
      ? await db.select().from(notificationsTable).where(and(...conditions)).orderBy(desc(notificationsTable.createdAt)).limit(200)
      : await db.select().from(notificationsTable).orderBy(desc(notificationsTable.createdAt)).limit(200);
    res.json(notifications);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/notifications/departments", requireAuth, requirePermission("notifications"), async (_req, res): Promise<void> => {
  try {
    const depts = await db.select({ id: departmentsTable.id, name: departmentsTable.name }).from(departmentsTable);
    res.json(depts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/notifications/send", requireAuth, requirePermission("notifications"), async (req, res): Promise<void> => {
  try {
    const { type, channel, recipients, subject, message, departmentId, templateId, extraVars } = req.body;
    if (!type || !channel || !subject || !message) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const userRole = req.user!.role;
    const userDeptId = req.user!.departmentId;
    const tplId = templateId ? Number(templateId) : null;

    const institution = await getInstitutionInfo();
    const baseCtx: Record<string, string> = {
      college_name: institution.collegeName,
      college_phone: institution.phone,
      college_email: institution.email,
      college_website: institution.website,
      principal_name: institution.principalName,
      current_date: formatDate(),
      academic_year: institution.currentAcademicYear,
      ...(extraVars && typeof extraVars === "object" ? extraVars : {}),
    };

    const sentNotifications: any[] = [];

    const shouldSendToStudents = ["all_students", "all", "dept_students"].includes(recipients);
    const shouldSendToStaff = ["all_staff", "all"].includes(recipients);

    if (shouldSendToStudents) {
      let studentConditions: any[] = [eq(studentsTable.status, "Active")];

      if (recipients === "dept_students" && departmentId) {
        studentConditions.push(eq(studentsTable.departmentId, Number(departmentId)));
      } else if (userRole === "Faculty" || userRole === "HOD") {
        if (userDeptId) {
          studentConditions.push(eq(studentsTable.departmentId, userDeptId));
        }
      }

      const studentRows = studentConditions.length > 1
        ? await db.select({ s: studentsTable, deptName: departmentsTable.name, courseName: coursesTable.name })
            .from(studentsTable)
            .leftJoin(departmentsTable, eq(studentsTable.departmentId, departmentsTable.id))
            .leftJoin(coursesTable, eq(studentsTable.courseId, coursesTable.id))
            .where(and(...studentConditions))
        : await db.select({ s: studentsTable, deptName: departmentsTable.name, courseName: coursesTable.name })
            .from(studentsTable)
            .leftJoin(departmentsTable, eq(studentsTable.departmentId, departmentsTable.id))
            .leftJoin(coursesTable, eq(studentsTable.courseId, coursesTable.id))
            .where(studentConditions[0]);

      for (const row of studentRows) {
        const s = row.s;
        const contact = channel === "email" ? (s.email || "") : (s.phone || "");
        if (channel === "whatsapp" && !s.phone) continue;
        if (channel === "email" && !s.email) continue;
        const ctx = {
          ...baseCtx,
          student_name: `${s.firstName} ${s.lastName}`,
          first_name: s.firstName,
          last_name: s.lastName,
          roll_number: s.rollNumber,
          email: s.email || "",
          phone: s.phone || "",
          guardian_phone: s.guardianPhone || "",
          father_name: s.fatherName || "",
          mother_name: s.motherName || "",
          department_name: row.deptName || "",
          course_name: row.courseName || "",
          year: s.year,
          semester: s.semester,
          batch: s.batch || "",
        };
        const [n] = await db.insert(notificationsTable).values({
          type, channel, recipientName: `${s.firstName} ${s.lastName}`,
          recipientContact: channel === "whatsapp" ? (s.phone || "") : contact,
          subject: renderTemplate(subject, ctx),
          message: renderTemplate(message, ctx),
          status: "Sent", sentAt: new Date(), studentId: s.id, templateId: tplId,
        }).returning();
        sentNotifications.push(n);
      }
    }

    if (shouldSendToStaff) {
      let staffConditions: any[] = [eq(staffTable.status, "Active")];

      if (userRole === "HOD" && userDeptId) {
        staffConditions.push(eq(staffTable.departmentId, userDeptId));
      }

      const staffRows = staffConditions.length > 1
        ? await db.select({ s: staffTable, deptName: departmentsTable.name })
            .from(staffTable)
            .leftJoin(departmentsTable, eq(staffTable.departmentId, departmentsTable.id))
            .where(and(...staffConditions))
        : await db.select({ s: staffTable, deptName: departmentsTable.name })
            .from(staffTable)
            .leftJoin(departmentsTable, eq(staffTable.departmentId, departmentsTable.id))
            .where(staffConditions[0]);

      for (const row of staffRows) {
        const s = row.s;
        const contact = channel === "email" ? (s.email || "") : (s.phone || "");
        if (channel === "whatsapp" && !s.phone) continue;
        if (channel === "email" && !s.email) continue;
        const ctx = {
          ...baseCtx,
          staff_name: `${s.firstName} ${s.lastName}`,
          first_name: s.firstName,
          last_name: s.lastName,
          staff_id: s.staffId,
          email: s.email || "",
          phone: s.phone || "",
          designation: s.designation,
          department_name: row.deptName || "",
        };
        const [n] = await db.insert(notificationsTable).values({
          type, channel, recipientName: `${s.firstName} ${s.lastName}`,
          recipientContact: channel === "whatsapp" ? (s.phone || "") : contact,
          subject: renderTemplate(subject, ctx),
          message: renderTemplate(message, ctx),
          status: "Sent", sentAt: new Date(), staffId: s.id, templateId: tplId,
        }).returning();
        sentNotifications.push(n);
      }
    }

    if (Array.isArray(recipients)) {
      for (const r of recipients) {
        const ctx = {
          ...baseCtx,
          student_name: r.name || "",
          staff_name: r.name || "",
          first_name: r.name ? String(r.name).split(" ")[0] : "",
          email: channel === "email" ? r.contact || "" : "",
          phone: channel !== "email" ? r.contact || "" : "",
          ...(r.vars && typeof r.vars === "object" ? r.vars : {}),
        };
        const [n] = await db.insert(notificationsTable).values({
          type, channel, recipientName: r.name || "Unknown",
          recipientContact: r.contact || "",
          subject: renderTemplate(subject, ctx),
          message: renderTemplate(message, ctx),
          status: "Sent", sentAt: new Date(),
          studentId: r.studentId || null, staffId: r.staffId || null, templateId: tplId,
        }).returning();
        sentNotifications.push(n);
      }
    }

    await logActivity("notification_sent", `Sent ${sentNotifications.length} ${channel} notifications: ${subject}`, "");
    res.json({ sent: sentNotifications.length, notifications: sentNotifications });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/notifications/stats", requireAuth, requirePermission("notifications"), async (_req, res): Promise<void> => {
  try {
    const all = await db.select().from(notificationsTable);
    const stats = {
      total: all.length,
      whatsapp: all.filter(n => n.channel === "whatsapp").length,
      email: all.filter(n => n.channel === "email").length,
      sms: all.filter(n => n.channel === "sms").length,
      sent: all.filter(n => n.status === "Sent").length,
      failed: all.filter(n => n.status === "Failed").length,
      pending: all.filter(n => n.status === "Pending").length,
    };
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
