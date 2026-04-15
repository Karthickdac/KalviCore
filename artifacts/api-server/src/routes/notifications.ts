import { Router, type IRouter } from "express";
import { db, notificationsTable, studentsTable, staffTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { requireAuth, requirePermission } from "../middleware/auth";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/notifications", requireAuth, requirePermission("communications"), async (req, res): Promise<void> => {
  try {
    const { channel, status } = req.query;
    const conditions: any[] = [];
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

router.post("/notifications/send", requireAuth, requirePermission("communications"), async (req, res): Promise<void> => {
  try {
    const { type, channel, recipients, subject, message } = req.body;
    if (!type || !channel || !subject || !message) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const sentNotifications: any[] = [];

    if (recipients === "all_students" || recipients === "all") {
      const students = await db.select().from(studentsTable).where(eq(studentsTable.status, "Active"));
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

    if (recipients === "all_staff" || recipients === "all") {
      const staffMembers = await db.select().from(staffTable).where(eq(staffTable.status, "Active"));
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

router.get("/notifications/stats", requireAuth, requirePermission("communications"), async (_req, res): Promise<void> => {
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
