import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, usersTable, ROLES, ROLE_PERMISSIONS } from "@workspace/db";
import { createSession, destroySession, requireAuth, requireRole, getEffectivePermissions } from "../middleware/auth";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
  if (!user || !user.isActive) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  await db.update(usersTable).set({ lastLogin: new Date() }).where(eq(usersTable.id, user.id));
  const token = createSession(user.id);
  await logActivity("user_login", `${user.fullName} logged in`, String(user.id));
  res.json({
    token,
    user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName, role: user.role, departmentId: user.departmentId },
  });
});

router.post("/auth/logout", (req, res): void => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    destroySession(authHeader.slice(7));
  }
  res.json({ success: true });
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const perms = await getEffectivePermissions(req.user!.role);
  res.json({
    id: req.user!.id,
    username: req.user!.username,
    email: req.user!.email,
    fullName: req.user!.fullName,
    role: req.user!.role,
    departmentId: req.user!.departmentId,
    staffRecordId: req.user!.staffRecordId || null,
    studentRecordId: req.user!.studentRecordId || null,
    courseId: req.user!.courseId || null,
    permissions: perms,
  });
});

router.get("/auth/roles", (req, res): void => {
  res.json(ROLES);
});

router.get("/users", requireAuth, requireRole("SuperAdmin", "Admin"), async (_req, res): Promise<void> => {
  const users = await db.select({
    id: usersTable.id,
    username: usersTable.username,
    email: usersTable.email,
    fullName: usersTable.fullName,
    role: usersTable.role,
    departmentId: usersTable.departmentId,
    isActive: usersTable.isActive,
    lastLogin: usersTable.lastLogin,
    createdAt: usersTable.createdAt,
  }).from(usersTable);
  res.json(users);
});

router.post("/users", requireAuth, requireRole("SuperAdmin", "Admin"), async (req, res): Promise<void> => {
  const { username, email, password, fullName, role, departmentId, isActive } = req.body;
  if (!username || !email || !password || !fullName || !role) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  if (!ROLES.includes(role)) {
    res.status(400).json({ error: "Invalid role" });
    return;
  }
  if (role === "SuperAdmin" && req.user!.role !== "SuperAdmin") {
    res.status(403).json({ error: "Only SuperAdmin can create SuperAdmin users" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const [user] = await db.insert(usersTable).values({ username, email, passwordHash, fullName, role, departmentId: departmentId || null, isActive: isActive ?? true }).returning();
    await logActivity("user_created", `User created: ${fullName} (${role})`, String(user.id));
    res.status(201).json({ id: user.id, username: user.username, email: user.email, fullName: user.fullName, role: user.role, departmentId: user.departmentId, isActive: user.isActive, createdAt: user.createdAt });
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(409).json({ error: "Username or email already exists" });
      return;
    }
    throw err;
  }
});

router.patch("/users/:id", requireAuth, requireRole("SuperAdmin", "Admin"), async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const { password, ...rest } = req.body;
  const updateData: any = { ...rest };
  if (password) {
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }
  delete updateData.id;
  delete updateData.createdAt;
  delete updateData.lastLogin;
  const [user] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, id)).returning();
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ id: user.id, username: user.username, email: user.email, fullName: user.fullName, role: user.role, departmentId: user.departmentId, isActive: user.isActive, createdAt: user.createdAt });
});

router.delete("/users/:id", requireAuth, requireRole("SuperAdmin"), async (req, res): Promise<void> => {
  await db.delete(usersTable).where(eq(usersTable.id, Number(req.params.id)));
  res.json({ success: true });
});

router.post("/auth/seed-admin", async (_req, res): Promise<void> => {
  if (process.env.NODE_ENV === "production") {
    res.status(403).json({ error: "Not available in production" });
    return;
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.role, "SuperAdmin"));
  if (existing.length > 0) {
    res.status(409).json({ error: "Admin already exists" });
    return;
  }
  const passwordHash = await bcrypt.hash("admin123", 10);
  const [user] = await db.insert(usersTable).values({
    username: "admin",
    email: "admin@college.edu",
    passwordHash,
    fullName: "System Administrator",
    role: "SuperAdmin",
    isActive: true,
  }).returning();
  res.status(201).json({ message: "Admin created. Change the password immediately." });
});

export default router;
