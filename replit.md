# College Management System (EduManage TN)

## Overview

A comprehensive College Management System built for Tamil Nadu, India. Full-stack React + Vite frontend with Express backend, covering Students, Staff, Departments, Courses, Subjects, Attendance, Fees, and Exams.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 19, Vite, Tailwind CSS, shadcn/ui, Recharts, Wouter (routing)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod, drizzle-zod
- **API codegen**: Orval (from OpenAPI spec → React Query hooks + Zod schemas)
- **Build**: esbuild (CJS bundle)

## Modules

1. **Dashboard** — Overview with student/staff counts, department strength chart, fee collection summary, recent activity
2. **Students** — Enrollment, Tamil Nadu community categories (OC/BC/MBC/SC/ST), scholarship tracking, first-graduate flag, Aadhar, district
3. **Staff** — Faculty management with designation, qualification, specialization, experience, salary
4. **Departments** — Department CRUD with HOD, contact info, established year
5. **Courses** — Anna University regulation-wise courses, affiliated university, degree programs (B.E., B.Tech, M.E., MBA, MCA)
6. **Subjects** — Curriculum management with course mapping, credits, type (Theory/Lab/Elective), staff assignment
7. **Attendance** — Mark attendance by subject/date, student attendance summary with percentage tracking
8. **Fees** — Fee structures per course/year, payment recording (Cash/Cheque/Online/DD/Razorpay), student dues tracking, Razorpay online payment integration
9. **Exams** — Exam scheduling (Internal/External/Supplementary), results entry with marks/grade/status

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema

12 tables: departments, courses, students, staff, subjects, attendance, fee_structures, fee_payments, pending_orders, exams, exam_results, activity_log

## Tamil Nadu-Specific Features

- Community categories: OC, BC, MBC, SC, ST
- Scholarship tracking (BC/MBC/SC-ST/Merit scholarships)
- First-graduate flag
- Anna University affiliation and regulation-wise course management
- District field for Tamil Nadu districts
- Aadhar number field
- Indian Rupee formatting for all fee amounts
- Razorpay payment gateway integration (UPI, Cards, Net Banking) with server-side order tracking and HMAC signature verification

## Project Structure

- `lib/api-spec/` — OpenAPI specification (openapi.yaml)
- `lib/api-zod/` — Generated Zod schemas
- `lib/api-client-react/` — Generated React Query hooks
- `lib/db/` — Drizzle ORM schema and database connection
- `artifacts/api-server/` — Express backend with all API routes
- `artifacts/college-cms/` — React + Vite frontend

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
