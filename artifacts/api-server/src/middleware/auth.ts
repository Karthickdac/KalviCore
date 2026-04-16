import { Request, Response, NextFunction } from "express";
import { eq, and } from "drizzle-orm";
import { db, usersTable, ROLE_PERMISSIONS, rolePermissionsTable, staffTable, studentsTable } from "@workspace/db";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        fullName: string;
        role: string;
        departmentId: number | null;
        staffRecordId?: number | null;
        studentRecordId?: number | null;
        courseId?: number | null;
      };
    }
  }
}

const userContextCache = new Map<number, { staffRecordId: number | null; studentRecordId: number | null; courseId: number | null; expiry: number }>();
const CONTEXT_CACHE_TTL = 60_000;

export async function resolveUserContext(userId: number, role: string, email: string, departmentId: number | null) {
  const cached = userContextCache.get(userId);
  if (cached && cached.expiry > Date.now()) return cached;

  let staffRecordId: number | null = null;
  let studentRecordId: number | null = null;
  let courseId: number | null = null;

  if (["HOD", "Faculty", "Staff"].includes(role) && email) {
    const [staff] = await db.select({ id: staffTable.id }).from(staffTable)
      .where(eq(staffTable.email, email)).limit(1);
    if (staff) staffRecordId = staff.id;
  }

  if (role === "Student" && email) {
    const [student] = await db.select({ id: studentsTable.id, courseId: studentsTable.courseId })
      .from(studentsTable).where(eq(studentsTable.email, email)).limit(1);
    if (student) {
      studentRecordId = student.id;
      courseId = student.courseId;
    }
  }

  const ctx = { staffRecordId, studentRecordId, courseId, expiry: Date.now() + CONTEXT_CACHE_TTL };
  userContextCache.set(userId, ctx);
  return ctx;
}

const sessionStore = new Map<string, { userId: number; expiresAt: number }>();

export function createSession(userId: number): string {
  const token = crypto.randomUUID();
  sessionStore.set(token, { userId, expiresAt: Date.now() + 24 * 60 * 60 * 1000 });
  return token;
}

export function destroySession(token: string): void {
  sessionStore.delete(token);
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    next();
    return;
  }
  const token = authHeader.slice(7);
  const session = sessionStore.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) sessionStore.delete(token);
    next();
    return;
  }
  try {
    const [user] = await db.select({
      id: usersTable.id,
      username: usersTable.username,
      email: usersTable.email,
      fullName: usersTable.fullName,
      role: usersTable.role,
      departmentId: usersTable.departmentId,
    }).from(usersTable).where(eq(usersTable.id, session.userId));
    if (user) {
      const ctx = await resolveUserContext(user.id, user.role, user.email, user.departmentId);
      req.user = {
        ...user,
        staffRecordId: ctx.staffRecordId,
        studentRecordId: ctx.studentRecordId,
        courseId: ctx.courseId,
      };
    }
  } catch {}
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    if (req.user.role === "SuperAdmin") {
      next();
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
}

const permissionCache = new Map<string, { perms: string[]; expiry: number }>();
const CACHE_TTL = 30_000;

export async function getEffectivePermissions(role: string): Promise<string[]> {
  const defaults = ROLE_PERMISSIONS[role] || [];
  if (defaults.includes("*")) return ["*"];

  const cached = permissionCache.get(role);
  if (cached && cached.expiry > Date.now()) return cached.perms;

  try {
    const overrides = await db.select().from(rolePermissionsTable)
      .where(eq(rolePermissionsTable.role, role));

    if (overrides.length === 0) {
      permissionCache.set(role, { perms: defaults, expiry: Date.now() + CACHE_TTL });
      return defaults;
    }

    const overrideMap = new Map(overrides.map(o => [o.permission, o.enabled]));
    const allPermKeys = new Set([...defaults, ...overrides.map(o => o.permission)]);
    const effective: string[] = [];
    for (const key of allPermKeys) {
      const override = overrideMap.get(key);
      if (override !== undefined) {
        if (override) effective.push(key);
      } else if (defaults.includes(key)) {
        effective.push(key);
      }
    }

    permissionCache.set(role, { perms: effective, expiry: Date.now() + CACHE_TTL });
    return effective;
  } catch {
    return defaults;
  }
}

export function clearPermissionCache(role?: string) {
  if (role) {
    permissionCache.delete(role);
  } else {
    permissionCache.clear();
  }
}

export function requirePermission(module: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const perms = await getEffectivePermissions(req.user.role);
    if (perms.includes("*") || perms.includes(module)) {
      next();
      return;
    }
    res.status(403).json({ error: "Insufficient permissions for this module" });
  };
}
