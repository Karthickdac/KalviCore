import { Request } from "express";

export type UserScope = {
  role: string;
  departmentId: number | null;
  staffRecordId: number | null;
  studentRecordId: number | null;
  courseId: number | null;
  isAdmin: boolean;
  isHOD: boolean;
  isFaculty: boolean;
  isStaff: boolean;
  isStudent: boolean;
};

export function getUserScope(req: Request): UserScope {
  const user = req.user!;
  const role = user.role;
  return {
    role,
    departmentId: user.departmentId ?? null,
    staffRecordId: user.staffRecordId ?? null,
    studentRecordId: user.studentRecordId ?? null,
    courseId: user.courseId ?? null,
    isAdmin: ["SuperAdmin", "Admin", "Principal"].includes(role),
    isHOD: role === "HOD",
    isFaculty: role === "Faculty",
    isStaff: role === "Staff",
    isStudent: role === "Student",
  };
}
