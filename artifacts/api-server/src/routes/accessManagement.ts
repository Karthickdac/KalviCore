import { Router, type IRouter } from "express";
import { db, rolePermissionsTable, ROLES, ROLE_PERMISSIONS } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requirePermission, clearPermissionCache } from "../middleware/auth";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

const ALL_PERMISSIONS = [
  { key: "dashboard", label: "Dashboard", group: "Overview" },
  { key: "reports", label: "Reports & Analytics", group: "Overview" },
  { key: "calendar", label: "Academic Calendar", group: "Overview" },
  { key: "departments", label: "Departments", group: "Academics" },
  { key: "courses", label: "Courses", group: "Academics" },
  { key: "subjects", label: "Subjects", group: "Academics" },
  { key: "timetable", label: "Timetable", group: "Academics" },
  { key: "assignments", label: "Assignments", group: "Academics" },
  { key: "exams", label: "Exams & CGPA & Hall Tickets", group: "Academics" },
  { key: "id_cards", label: "ID Cards", group: "Academics" },
  { key: "placements", label: "Training & Placement", group: "Academics" },
  { key: "laboratory", label: "Laboratory Management", group: "Academics" },
  { key: "students", label: "Students & Portals", group: "People" },
  { key: "staff", label: "Staff & Payroll", group: "People" },
  { key: "attendance", label: "Attendance", group: "People" },
  { key: "leaves", label: "Staff Leaves", group: "People" },
  { key: "fees", label: "Fees", group: "Finance" },
  { key: "certificates", label: "Certificates", group: "Finance" },
  { key: "fundraising", label: "Fundraising", group: "Finance" },
  { key: "hostels", label: "Hostels", group: "Campus" },
  { key: "transport", label: "Transport", group: "Campus" },
  { key: "library", label: "Library", group: "Campus" },
  { key: "inventory", label: "Inventory", group: "Campus" },
  { key: "visitors", label: "Visitors", group: "Campus" },
  { key: "sports_ncc", label: "Sports, NCC & NSS", group: "Student Activities" },
  { key: "events", label: "Events", group: "Communication" },
  { key: "communications", label: "Communications", group: "Communication" },
  { key: "notifications", label: "Notifications", group: "Communication" },
  { key: "settings", label: "Settings & Backup & Logs", group: "Administration" },
  { key: "users", label: "User Management", group: "Administration" },
  { key: "print_templates", label: "Print Templates", group: "Administration" },
  { key: "dashboard_settings", label: "Dashboard Settings", group: "Administration" },
  { key: "access_management", label: "Access Management", group: "Administration" },
];

const EDITABLE_ROLES = ROLES.filter(r => r !== "SuperAdmin");

router.get("/access-management/permissions", requireAuth, requirePermission("access_management"), async (_req, res): Promise<void> => {
  try {
    const dbPerms = await db.select().from(rolePermissionsTable);
    const matrix: Record<string, Record<string, boolean>> = {};

    for (const role of EDITABLE_ROLES) {
      matrix[role] = {};
      const defaults = ROLE_PERMISSIONS[role] || [];
      for (const perm of ALL_PERMISSIONS) {
        const dbEntry = dbPerms.find(p => p.role === role && p.permission === perm.key);
        if (dbEntry) {
          matrix[role][perm.key] = dbEntry.enabled;
        } else {
          matrix[role][perm.key] = defaults.includes(perm.key);
        }
      }
    }

    res.json({ permissions: ALL_PERMISSIONS, roles: EDITABLE_ROLES, matrix });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/access-management/permissions", requireAuth, requirePermission("access_management"), async (req, res): Promise<void> => {
  try {
    const { role, permission, enabled } = req.body;
    if (!role || !permission || typeof enabled !== "boolean") {
      res.status(400).json({ error: "role, permission, and enabled (boolean) are required" });
      return;
    }
    if (role === "SuperAdmin") {
      res.status(403).json({ error: "Cannot modify SuperAdmin permissions" });
      return;
    }
    if (!EDITABLE_ROLES.includes(role)) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }
    if (!ALL_PERMISSIONS.some(p => p.key === permission)) {
      res.status(400).json({ error: "Invalid permission" });
      return;
    }

    const existing = await db.select().from(rolePermissionsTable)
      .where(and(eq(rolePermissionsTable.role, role), eq(rolePermissionsTable.permission, permission)));

    if (existing.length > 0) {
      await db.update(rolePermissionsTable)
        .set({ enabled, updatedAt: new Date() })
        .where(and(eq(rolePermissionsTable.role, role), eq(rolePermissionsTable.permission, permission)));
    } else {
      await db.insert(rolePermissionsTable).values({ role, permission, enabled });
    }

    clearPermissionCache(role);
    await logActivity("access_updated", `${permission} ${enabled ? "enabled" : "disabled"} for ${role}`, String(req.user!.id));
    res.json({ success: true, role, permission, enabled });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/access-management/reset", requireAuth, requirePermission("access_management"), async (req, res): Promise<void> => {
  try {
    const { role } = req.body;
    if (!role) {
      res.status(400).json({ error: "role is required" });
      return;
    }
    if (role === "SuperAdmin") {
      res.status(403).json({ error: "Cannot modify SuperAdmin permissions" });
      return;
    }
    if (!EDITABLE_ROLES.includes(role)) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }

    await db.delete(rolePermissionsTable).where(eq(rolePermissionsTable.role, role));
    clearPermissionCache(role);
    await logActivity("access_reset", `Permissions reset to defaults for ${role}`, String(req.user!.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
