import { Router, type IRouter } from "express";
import { db, studentsTable, staffTable } from "@workspace/db";
import { logActivity } from "../lib/activity";
import { requireAuth, requirePermission } from "../middleware/auth";

const router: IRouter = Router();

router.post("/bulk-import/students", requireAuth, requirePermission("settings"), async (req, res): Promise<void> => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      res.status(400).json({ error: "Provide an array of students" });
      return;
    }
    let inserted = 0;
    const errors: { row: number; error: string }[] = [];
    for (let i = 0; i < students.length; i++) {
      const s = students[i];
      try {
        if (!s.firstName || !s.rollNumber || !s.departmentId || !s.courseId) {
          errors.push({ row: i + 1, error: "Missing required fields (firstName, rollNumber, departmentId, courseId)" });
          continue;
        }
        await db.insert(studentsTable).values({
          firstName: s.firstName, lastName: s.lastName || "",
          rollNumber: s.rollNumber, email: s.email || null,
          phone: s.phone || null, departmentId: Number(s.departmentId), courseId: Number(s.courseId),
          year: Number(s.year || 1), semester: Number(s.semester || 1),
          admissionType: s.admissionType || "Government", community: s.community || "OC",
          gender: s.gender || "Male", dateOfBirth: s.dateOfBirth || "2000-01-01",
          address: s.address || null, fatherName: s.fatherName || null, guardianPhone: s.guardianPhone || null,
          admissionDate: s.admissionDate || new Date().toISOString().split("T")[0],
        });
        inserted++;
      } catch (err: any) {
        errors.push({ row: i + 1, error: err.message?.includes("duplicate") ? "Duplicate roll number or email" : err.message });
      }
    }
    await logActivity("bulk_import_students", `Imported ${inserted} students, ${errors.length} errors`, "");
    res.json({ inserted, errors, total: students.length });
  } catch (err: any) {
    res.status(500).json({ error: "Import failed: " + err.message });
  }
});

router.post("/bulk-import/staff", requireAuth, requirePermission("settings"), async (req, res): Promise<void> => {
  try {
    const { staff } = req.body;
    if (!Array.isArray(staff) || staff.length === 0) {
      res.status(400).json({ error: "Provide an array of staff" });
      return;
    }
    let inserted = 0;
    const errors: { row: number; error: string }[] = [];
    for (let i = 0; i < staff.length; i++) {
      const s = staff[i];
      try {
        if (!s.firstName || !s.staffId || !s.departmentId) {
          errors.push({ row: i + 1, error: "Missing required fields (firstName, staffId, departmentId)" });
          continue;
        }
        await db.insert(staffTable).values({
          firstName: s.firstName, lastName: s.lastName || "",
          staffId: s.staffId, email: s.email || null,
          phone: s.phone || null, departmentId: Number(s.departmentId),
          designation: s.designation || "Assistant Professor",
          qualification: s.qualification || null, specialization: s.specialization || null,
          experience: s.experience ? Number(s.experience) : null,
          salary: s.salary ? String(s.salary) : null,
          joiningDate: s.joiningDate || new Date().toISOString().split("T")[0],
          gender: s.gender || "Male", employmentType: s.employmentType || "Permanent",
        });
        inserted++;
      } catch (err: any) {
        errors.push({ row: i + 1, error: err.message?.includes("duplicate") ? "Duplicate staff ID or email" : err.message });
      }
    }
    await logActivity("bulk_import_staff", `Imported ${inserted} staff, ${errors.length} errors`, "");
    res.json({ inserted, errors, total: staff.length });
  } catch (err: any) {
    res.status(500).json({ error: "Import failed: " + err.message });
  }
});

router.get("/bulk-export/students", requireAuth, requirePermission("settings"), async (_req, res): Promise<void> => {
  try {
    const students = await db.select().from(studentsTable);
    const headers = ["rollNumber", "firstName", "lastName", "email", "phone", "departmentId", "courseId", "year", "semester", "admissionType", "community", "gender", "status"];
    const csv = [headers.join(","), ...students.map(s => headers.map(h => `"${String((s as any)[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=students_export.csv");
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: "Export failed: " + err.message });
  }
});

router.get("/bulk-export/staff", requireAuth, requirePermission("settings"), async (_req, res): Promise<void> => {
  try {
    const staff = await db.select().from(staffTable);
    const headers = ["staffId", "firstName", "lastName", "email", "phone", "departmentId", "designation", "qualification", "specialization", "experience", "salary", "status"];
    const csv = [headers.join(","), ...staff.map(s => headers.map(h => `"${String((s as any)[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=staff_export.csv");
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: "Export failed: " + err.message });
  }
});

export default router;
