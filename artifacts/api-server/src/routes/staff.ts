import { Router, type IRouter } from "express";
import { eq, and, ilike, type SQL } from "drizzle-orm";
import { db, staffTable } from "@workspace/db";
import {
  CreateStaffBody,
  ListStaffResponse,
  ListStaffQueryParams,
  GetStaffParams,
  GetStaffResponse,
  UpdateStaffParams,
  UpdateStaffBody,
  UpdateStaffResponse,
  DeleteStaffParams,
} from "@workspace/api-zod";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/staff", async (req, res): Promise<void> => {
  const query = ListStaffQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const conditions: SQL[] = [];
  if (query.data.departmentId) conditions.push(eq(staffTable.departmentId, query.data.departmentId));
  if (query.data.designation) conditions.push(eq(staffTable.designation, query.data.designation));
  if (query.data.search) conditions.push(ilike(staffTable.firstName, `%${query.data.search}%`));

  const staff = conditions.length > 0
    ? await db.select().from(staffTable).where(and(...conditions)).orderBy(staffTable.staffId)
    : await db.select().from(staffTable).orderBy(staffTable.staffId);

  const mapped = staff.map(s => ({ ...s, salary: s.salary ? Number(s.salary) : null }));
  res.json(ListStaffResponse.parse(mapped));
});

router.post("/staff", async (req, res): Promise<void> => {
  const parsed = CreateStaffBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const values = {
    ...parsed.data,
    salary: parsed.data.salary != null ? String(parsed.data.salary) : null,
  };
  const [member] = await db.insert(staffTable).values(values).returning();
  await logActivity("staff_added", `Staff "${member.firstName} ${member.lastName}" added`, `${member.firstName} ${member.lastName}`);
  const mapped = { ...member, salary: member.salary ? Number(member.salary) : null };
  res.status(201).json(GetStaffResponse.parse(mapped));
});

router.get("/staff/:id", async (req, res): Promise<void> => {
  const params = GetStaffParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [member] = await db.select().from(staffTable).where(eq(staffTable.id, params.data.id));
  if (!member) {
    res.status(404).json({ error: "Staff not found" });
    return;
  }
  const mapped = { ...member, salary: member.salary ? Number(member.salary) : null };
  res.json(GetStaffResponse.parse(mapped));
});

router.patch("/staff/:id", async (req, res): Promise<void> => {
  const params = UpdateStaffParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateStaffBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const values: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.salary !== undefined) {
    values.salary = parsed.data.salary != null ? String(parsed.data.salary) : null;
  }
  const [member] = await db.update(staffTable).set(values).where(eq(staffTable.id, params.data.id)).returning();
  if (!member) {
    res.status(404).json({ error: "Staff not found" });
    return;
  }
  const mapped = { ...member, salary: member.salary ? Number(member.salary) : null };
  res.json(UpdateStaffResponse.parse(mapped));
});

router.delete("/staff/:id", async (req, res): Promise<void> => {
  const params = DeleteStaffParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [member] = await db.delete(staffTable).where(eq(staffTable.id, params.data.id)).returning();
  if (!member) {
    res.status(404).json({ error: "Staff not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
