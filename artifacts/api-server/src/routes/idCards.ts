import { Router, type IRouter } from "express";
import { db, studentsTable, staffTable, departmentsTable, coursesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requirePermission } from "../middleware/auth";

const router: IRouter = Router();

router.get("/id-cards/student/:studentId", requireAuth, requirePermission("id_cards"), async (req, res): Promise<void> => {
  try {
    const studentId = Number(req.params.studentId);
    if (isNaN(studentId)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, studentId));
    if (!student) { res.status(404).json({ error: "Student not found" }); return; }

    const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, student.departmentId));
    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, student.courseId));

    res.json({
      idCard: {
        type: "Student",
        name: `${student.firstName} ${student.lastName}`,
        rollNumber: student.rollNumber,
        department: dept?.name || "-",
        course: course?.name || "-",
        year: student.year,
        semester: student.semester,
        bloodGroup: student.bloodGroup || "-",
        phone: student.phone || "-",
        email: student.email || "-",
        address: student.address || "-",
        guardianPhone: student.guardianPhone || "-",
        admissionDate: student.admissionDate,
        status: student.status,
        gender: student.gender,
        community: student.community,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/id-cards/staff/:staffId", requireAuth, requirePermission("id_cards"), async (req, res): Promise<void> => {
  try {
    const staffId = Number(req.params.staffId);
    if (isNaN(staffId)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const [staff] = await db.select().from(staffTable).where(eq(staffTable.id, staffId));
    if (!staff) { res.status(404).json({ error: "Staff not found" }); return; }

    const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, staff.departmentId));

    res.json({
      idCard: {
        type: "Staff",
        name: `${staff.firstName} ${staff.lastName}`,
        staffId: staff.staffId,
        department: dept?.name || "-",
        designation: staff.designation,
        qualification: staff.qualification || "-",
        phone: staff.phone || "-",
        email: staff.email || "-",
        address: staff.address || "-",
        joiningDate: staff.joiningDate,
        employmentType: staff.employmentType,
        status: staff.status,
        gender: staff.gender,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
