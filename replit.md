# College Management System (EduManage TN)

## Overview

A comprehensive College Management System built for Tamil Nadu, India. Full-stack React + Vite frontend with Express backend, covering 20+ modules: Students (with admissions workflow, alumni, disciplinary), Staff, Departments, Courses, Subjects, Attendance (with condonation), Fees (Razorpay, instalments, defaulters, scholarships), Exams, Hostels, Transport, Library, Events/Cultural, Communications, Inventory/Assets, Timetable, Assignments, Certificates, Staff Leaves, and Settings/Configuration.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React 19, Vite, Tailwind CSS, shadcn/ui, Recharts, Wouter (routing)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod, drizzle-zod
- **API codegen**: Orval (from OpenAPI spec -> React Query hooks + Zod schemas)
- **Build**: esbuild (CJS bundle)

## Modules

### Core Academic
1. **Dashboard** — Overview with student/staff counts, department strength chart, fee collection summary, recent activity
2. **Departments** — Department CRUD with HOD, contact info, established year
3. **Courses** — Anna University regulation-wise courses, affiliated university, degree programs (B.E., B.Tech, M.E., MBA, MCA)
4. **Subjects** — Curriculum management with course mapping, credits, type (Theory/Lab/Elective), staff assignment
5. **Timetable** — Department/semester-wise timetable management with day, period, subject, staff, room allocation
6. **Assignments** — Assignment creation, student submissions tracking, grading with marks and grade calculation
7. **Exams** — Exam scheduling (Internal/External/Supplementary), results entry with marks/grade/status

### People Management
8. **Students** — Enrollment with admissions workflow (Applied/Provisional/Confirmed/Rejected), alumni tracking, disciplinary records, Tamil Nadu community categories (OC/BC/MBC/SC/ST)
9. **Staff** — Faculty management with designation, qualification, specialization, experience, salary
10. **Attendance** — Mark attendance by subject/date, student attendance summary with 75% threshold alerts, condonation requests with approval workflow
11. **Staff Leaves** — Leave applications (CL/SL/EL/ML/PL/OD/LOP), approval workflow

### Finance
12. **Fees** — Fee structures, payment recording (Cash/Cheque/Online/DD/Razorpay), Razorpay integration, fee instalments with due dates, fee defaulter tracking, scholarship management (Merit/Need-Based/Government/SC-ST/BC-MBC/First Graduate/Sports)
13. **Certificates** — Certificate requests (Bonafide/TC/Conduct/Migration etc.), approval and issuance workflow

### Campus Management
14. **Hostels** — Hostel management, room allocation, student allocations, mess type, complaints
15. **Transport** — Routes, vehicles, stops, student transport allocations
16. **Library** — Book catalog, issue/return management, fine tracking
17. **Inventory** — Asset management (tagging, condition tracking), store items with stock levels

### Engagement
18. **Events** — Event management (Cultural/Sports/Technical), participant registration, achievements
19. **Communications** — Announcements, notices, grievance management with resolution tracking

### System
20. **Settings** — Institution configuration (name, code, university, contact), academic settings (year, semester, attendance threshold, grading system), fee settings (late fee, reminders, Razorpay toggle), custom key-value settings

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema

28+ tables: departments, courses, students, staff, subjects, attendance, fee_structures, fee_payments, pending_orders, exams, exam_results, activity_log, hostels, hostel_rooms, hostel_allocations, hostel_complaints, transport_routes, transport_vehicles, transport_stops, transport_allocations, library_books, library_issued_books, events, event_participants, announcements, grievances, assets, store_items, timetable, assignments, assignment_submissions, certificates, staff_leaves, disciplinary_records, fee_instalments, scholarships, attendance_condonation, institution_settings

## CRITICAL Notes

- **After codegen**: Always fix `lib/api-zod/src/index.ts` to only export `./generated/api` (codegen overwrites it to also export `./generated/types` which causes duplicate exports)
- **Filter pattern**: Use `filter && filter !== "all" ? Number(filter) : undefined` for dropdown filters
- **Mutation pattern**: `useUpdateX()` — no ID in hook, `mutation.mutate({ id, data })`

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

## Sidebar Navigation

Grouped into: Overview, Academics, People, Finance, Campus, Engagement, System

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
