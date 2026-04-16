import { Router, type IRouter } from "express";
import { db, examsTable, studentsTable, subjectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requirePermission } from "../middleware/auth";
import { getUserScope } from "../lib/scopeFilter";

const router: IRouter = Router();

router.get("/hall-tickets/:studentId/:examId", requireAuth, requirePermission("exams"), async (req, res): Promise<void> => {
  try {
    const studentId = Number(req.params.studentId);
    const examId = Number(req.params.examId);
    if (isNaN(studentId) || isNaN(examId)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const scope = getUserScope(req);
    if (scope?.isStudent && scope.studentRecordId !== studentId) {
      res.status(403).json({ error: "You can only view your own hall ticket" });
      return;
    }

    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, studentId));
    if (!student) { res.status(404).json({ error: "Student not found" }); return; }

    const [exam] = await db.select().from(examsTable).where(eq(examsTable.id, examId));
    if (!exam) { res.status(404).json({ error: "Exam not found" }); return; }

    const subjects = await db.select().from(subjectsTable).where(eq(subjectsTable.courseId, student.courseId));

    const seatNumber = `${exam.type?.charAt(0) || "E"}${String(studentId).padStart(4, "0")}`;

    res.json({
      hallTicket: {
        studentName: `${student.firstName} ${student.lastName}`,
        rollNumber: student.rollNumber,
        department: student.departmentId,
        course: student.courseId,
        semester: exam.semester,
        examName: `${exam.type} - Semester ${exam.semester}`,
        examType: exam.type,
        examDate: exam.date,
        seatNumber,
        subjects: subjects.map(s => ({ id: s.id, name: s.name, code: s.code, type: s.type })),
        photo: null,
        instructions: [
          "Candidates must be present at the exam hall 15 minutes before the exam starts.",
          "Carry this hall ticket and a valid college ID card.",
          "Electronic devices including mobile phones are strictly prohibited.",
          "Use only blue or black ink pens for writing.",
          "Any form of malpractice will lead to cancellation of the exam.",
        ],
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to generate hall ticket: " + err.message });
  }
});

router.get("/hall-tickets/student/:studentId", requireAuth, requirePermission("exams"), async (req, res): Promise<void> => {
  try {
    const studentId = Number(req.params.studentId);
    if (isNaN(studentId)) { res.status(400).json({ error: "Invalid student ID" }); return; }

    const scope = getUserScope(req);
    if (scope?.isStudent && scope.studentRecordId !== studentId) {
      res.status(403).json({ error: "You can only view your own hall tickets" });
      return;
    }

    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, studentId));
    if (!student) { res.status(404).json({ error: "Student not found" }); return; }

    const exams = await db.select().from(examsTable);
    const available = exams.map(e => ({
      examId: e.id, examName: `${e.type} - Semester ${e.semester}`, examType: e.type, semester: e.semester, date: e.date,
    }));
    res.json(available);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
