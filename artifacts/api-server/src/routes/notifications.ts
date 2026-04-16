import { Router, type IRouter } from "express";
import { db, notificationsTable, studentsTable, staffTable, departmentsTable } from "@workspace/db";
import { eq, desc, and, sql, inArray } from "drizzle-orm";
import { requireAuth, requirePermission } from "../middleware/auth";
import { logActivity } from "../lib/activity";
import { getUserScope } from "../lib/scopeFilter";

const router: IRouter = Router();

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
    const { type, channel, recipients, subject, message, departmentId } = req.body;
    if (!type || !channel || !subject || !message) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const userRole = req.user!.role;
    const userDeptId = req.user!.departmentId;

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

      const students = studentConditions.length > 1
        ? await db.select().from(studentsTable).where(and(...studentConditions))
        : await db.select().from(studentsTable).where(studentConditions[0]);

      for (const s of students) {
        const contact = channel === "email" ? (s.email || "") : (s.phone || "");
        if (channel === "whatsapp" && !s.phone) continue;
        if (channel === "email" && !s.email) continue;
        const [n] = await db.insert(notificationsTable).values({
          type, channel, recipientName: `${s.firstName} ${s.lastName}`,
          recipientContact: channel === "whatsapp" ? (s.phone || "") : contact, subject, message,
          status: "Sent", sentAt: new Date(), studentId: s.id,
        }).returning();
        sentNotifications.push(n);
      }
    }

    if (shouldSendToStaff) {
      let staffConditions: any[] = [eq(staffTable.status, "Active")];

      if (userRole === "HOD" && userDeptId) {
        staffConditions.push(eq(staffTable.departmentId, userDeptId));
      }

      const staffMembers = staffConditions.length > 1
        ? await db.select().from(staffTable).where(and(...staffConditions))
        : await db.select().from(staffTable).where(staffConditions[0]);

      for (const s of staffMembers) {
        const contact = channel === "email" ? (s.email || "") : (s.phone || "");
        if (channel === "whatsapp" && !s.phone) continue;
        if (channel === "email" && !s.email) continue;
        const [n] = await db.insert(notificationsTable).values({
          type, channel, recipientName: `${s.firstName} ${s.lastName}`,
          recipientContact: channel === "whatsapp" ? (s.phone || "") : contact, subject, message,
          status: "Sent", sentAt: new Date(), staffId: s.id,
        }).returning();
        sentNotifications.push(n);
      }
    }

    if (Array.isArray(recipients)) {
      for (const r of recipients) {
        const [n] = await db.insert(notificationsTable).values({
          type, channel, recipientName: r.name || "Unknown",
          recipientContact: r.contact || "", subject, message,
          status: "Sent", sentAt: new Date(),
          studentId: r.studentId || null, staffId: r.staffId || null,
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
