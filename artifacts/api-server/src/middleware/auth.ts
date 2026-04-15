import { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, ROLE_PERMISSIONS } from "@workspace/db";

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
      };
    }
  }
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
      req.user = user;
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

export function requirePermission(module: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    const perms = ROLE_PERMISSIONS[req.user.role];
    if (!perms) {
      res.status(403).json({ error: "Role not configured" });
      return;
    }
    if (perms.includes("*") || perms.includes(module)) {
      next();
      return;
    }
    res.status(403).json({ error: "Insufficient permissions for this module" });
  };
}
