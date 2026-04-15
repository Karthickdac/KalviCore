import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, departmentsTable } from "@workspace/db";
import {
  CreateDepartmentBody,
  ListDepartmentsResponse,
  GetDepartmentParams,
  GetDepartmentResponse,
  UpdateDepartmentParams,
  UpdateDepartmentBody,
  UpdateDepartmentResponse,
  DeleteDepartmentParams,
} from "@workspace/api-zod";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/departments", async (_req, res): Promise<void> => {
  const departments = await db.select().from(departmentsTable).orderBy(departmentsTable.name);
  res.json(ListDepartmentsResponse.parse(departments));
});

router.post("/departments", async (req, res): Promise<void> => {
  const parsed = CreateDepartmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [dept] = await db.insert(departmentsTable).values(parsed.data).returning();
  await logActivity("department_created", `New department "${dept.name}" created`, dept.name);
  res.status(201).json(GetDepartmentResponse.parse(dept));
});

router.get("/departments/:id", async (req, res): Promise<void> => {
  const params = GetDepartmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, params.data.id));
  if (!dept) {
    res.status(404).json({ error: "Department not found" });
    return;
  }
  res.json(GetDepartmentResponse.parse(dept));
});

router.patch("/departments/:id", async (req, res): Promise<void> => {
  const params = UpdateDepartmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateDepartmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [dept] = await db.update(departmentsTable).set(parsed.data).where(eq(departmentsTable.id, params.data.id)).returning();
  if (!dept) {
    res.status(404).json({ error: "Department not found" });
    return;
  }
  res.json(UpdateDepartmentResponse.parse(dept));
});

router.delete("/departments/:id", async (req, res): Promise<void> => {
  const params = DeleteDepartmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [dept] = await db.delete(departmentsTable).where(eq(departmentsTable.id, params.data.id)).returning();
  if (!dept) {
    res.status(404).json({ error: "Department not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
