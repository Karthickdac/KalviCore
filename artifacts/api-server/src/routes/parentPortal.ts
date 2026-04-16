import { Router, type IRouter } from "express";
import { db, studentsTable, departmentsTable, coursesTable, feePaymentsTable, examResultsTable, examsTable, subjectsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router: IRouter = Router();

async function verifyParentAccess(rollNumber: string, guardianPhone: string): Promise<any | null> {
  if (!rollNumber || !guardianPhone) return null;
  const [student] = await db.select().from(studentsTable).where(
    and(eq(studentsTable.rollNumber, rollNumber), eq(studentsTable.guardianPhone, guardianPhone))
  );
  return student || null;
}

router.post("/parent-portal/login", async (req, res): Promise<void> => {
  try {
    const { rollNumber, guardianPhone } = req.body;
    if (!rollNumber || !guardianPhone) {
      res.status(400).json({ error: "Roll number and guardian phone are required" });
      return;
    }
    const student = await verifyParentAccess(rollNumber, guardianPhone);
    if (!student) {
      res.status(401).json({ error: "Invalid roll number or guardian phone number" });
      return;
    }
    const [dept] = await db.select().from(departmentsTable).where(eq(departmentsTable.id, student.departmentId));
    const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, student.courseId));
    res.json({
      student: {
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
        rollNumber: student.rollNumber,
        department: dept?.name || "-",
        course: course?.name || "-",
        year: student.year,
        semester: student.semester,
        email: student.email,
        phone: student.phone,
        status: student.status,
        gender: student.gender,
        community: student.community,
        bloodGroup: student.bloodGroup,
        fatherName: student.fatherName,
        guardianPhone: student.guardianPhone,
        address: student.address,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/parent-portal/student/:studentId", async (req, res): Promise<void> => {
  try {
    const studentId = Number(req.params.studentId);
    if (isNaN(studentId)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, studentId));
    if (!student) { res.status(404).json({ error: "Student not found" }); return; }
    const [dept] = student.departmentId ? await db.select().from(departmentsTable).where(eq(departmentsTable.id, student.departmentId)) : [null];
    const [course] = student.courseId ? await db.select().from(coursesTable).where(eq(coursesTable.id, student.courseId)) : [null];
    res.json({
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      rollNumber: student.rollNumber,
      department: dept?.name || "-",
      course: course?.name || "-",
      year: student.year,
      semester: student.semester,
      email: student.email,
      phone: student.phone,
      status: student.status,
      gender: student.gender,
      community: student.community,
      bloodGroup: student.bloodGroup,
      fatherName: student.fatherName,
      guardianPhone: student.guardianPhone,
      address: student.address,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/parent-portal/fees/:studentId", async (req, res): Promise<void> => {
  try {
    const studentId = Number(req.params.studentId);
    if (isNaN(studentId)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const rollNumber = req.query.rollNumber as string;
    const guardianPhone = req.query.guardianPhone as string;
    if (rollNumber && guardianPhone) {
      const student = await verifyParentAccess(rollNumber, guardianPhone);
      if (!student || student.id !== studentId) {
        res.status(403).json({ error: "Access denied" });
        return;
      }
    }
    const payments = await db.select().from(feePaymentsTable).where(eq(feePaymentsTable.studentId, studentId));
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    res.json({ payments, totalPaid });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/parent-portal/results/:studentId", async (req, res): Promise<void> => {
  try {
    const studentId = Number(req.params.studentId);
    if (isNaN(studentId)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const rollNumber = req.query.rollNumber as string;
    const guardianPhone = req.query.guardianPhone as string;
    if (rollNumber && guardianPhone) {
      const student = await verifyParentAccess(rollNumber, guardianPhone);
      if (!student || student.id !== studentId) {
        res.status(403).json({ error: "Access denied" });
        return;
      }
    }
    const results = await db.select().from(examResultsTable).where(eq(examResultsTable.studentId, studentId));
    const enriched = await Promise.all(results.map(async (r) => {
      const [exam] = await db.select().from(examsTable).where(eq(examsTable.id, r.examId));
      const subject = exam ? (await db.select().from(subjectsTable).where(eq(subjectsTable.id, exam.subjectId)))[0] : null;
      return {
        ...r,
        examType: exam?.type || "-",
        subjectName: subject?.name || "-",
        subjectCode: subject?.code || "-",
        semester: exam?.semester || "-",
      };
    }));
    res.json(enriched);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
