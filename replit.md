# College Management System (EduManage TN)

## Overview

A comprehensive College Management System built for Tamil Nadu, India. Full-stack React + Vite frontend with Express backend, covering 38 modules: Students (with admissions workflow, alumni, disciplinary), Staff, Departments, Courses, Subjects, Attendance (with condonation), Fees (Razorpay, instalments, defaulters, scholarships), Exams, Hostels, Transport, Library, Events/Cultural, Communications, Inventory/Assets, Timetable, Assignments, Certificates, Staff Leaves, Settings/Configuration, Reports & Analytics, Academic Calendar, CGPA Tracker, Payroll, Activity Log, Bulk Import/Export, Hall Tickets, Student Portal, Data Backup, ID Cards, Notifications, Document Vault, Print Templates, Parent Portal, Dashboard Customization, Training & Placement, Fundraising & Donations, and Visitor Management.

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

### Analytics & Planning
20. **Reports & Analytics** — Student reports (by department, community, year, gender with charts), attendance reports (with below-threshold count), fee collection reports (by mode, monthly trend), exam results summary — all with CSV export and print
21. **Academic Calendar** — Monthly calendar view with events, holidays, exam dates, semester markers; event types: General, Holiday, Exam, Semester Start/End, Workshop, Cultural, Sports, Meeting
22. **CGPA Tracker** — Semester-wise GPA calculation with grade points (O=10, A+=9 ... F=0), cumulative CGPA, subject-level breakdown, GPA trend chart
23. **Activity Log** — Full audit trail viewer with search, action type badges, entity tracking

### People (Additional)
24. **Payroll** — Staff salary processing with basic, HRA, DA, TA, allowances, PF, tax deductions, net salary calculation, mark-as-paid workflow, monthly view

### Data Management
25. **Bulk Import/Export** — CSV upload for mass student/staff enrollment with preview, validation, error reporting; CSV export of all records; downloadable templates
26. **Hall Tickets** — Exam hall ticket generation with seat numbers, subject list, printable layout with signatures and instructions
27. **Student Portal** — Self-service view with student profile, attendance summary with 75% threshold alert, fee dues, CGPA trend chart, semester-wise results, personal info

### System
28. **Data Backup** — Full database export (JSON), record counts per table, admin-only access with role enforcement
29. **Settings** — Institution configuration (name, code, university, contact), academic settings (year, semester, attendance threshold, grading system), fee settings (late fee, reminders, Razorpay toggle), custom key-value settings
30. **User Management** — CRUD for system users with RBAC role assignment (SuperAdmin, Admin, Principal, HOD, Faculty, Staff, Student), role hierarchy enforcement
31. **Notifications** — WhatsApp/Email/SMS notification sending (simulated) to students/staff, notification history with channel and status filtering, stats dashboard with per-channel counts, WhatsApp default channel with visual channel selector
32. **Document Vault** — Student document metadata management (marksheets, certificates, ID proofs), verification workflow, search by student
33. **Print Templates** — Printable fee receipts, salary payslips, and certificates (Bonafide/TC/Conduct) with formal college letterhead layout
34. **Parent Portal** — Guardian login (roll number + phone), view student profile, fee payments, exam results; IDOR-protected with re-verification on data endpoints
35. **Dashboard Customization** — Per-user widget visibility and ordering, 12 configurable widgets across stats/finance/academic/charts categories, save/reset layout
36. **Training & Placement** — Company registration, placement drives (on-campus/off-campus/virtual), student applications with status workflow (Applied→Shortlisted→Placed/Rejected), training programs (Technical/Soft Skills/Aptitude/Communication), student enrollment, placement statistics with highest package tracking
37. **Fundraising & Donations** — Campaign management with goal tracking and progress bars, donation recording from individuals/corporates/alumni/parents/faculty, receipt number generation, payment mode tracking, auto-updated campaign totals, category-based campaigns (Infrastructure/Scholarship/Sports/Library/Lab Equipment)
38. **Visitor Management** — Visitor check-in with badge generation, check-out tracking, ID proof collection (Aadhar/Driving License/Voter ID/Passport), purpose categorization, vehicle number tracking, today/currently-in stats, visitor log with status filtering

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Database Schema

40+ tables: departments, courses, students, staff, subjects, attendance, fee_structures, fee_payments, pending_orders, exams, exam_results, activity_log, hostels, hostel_rooms, hostel_allocations, hostel_complaints, transport_routes, transport_vehicles, transport_stops, transport_allocations, library_books, library_issued_books, events, event_participants, announcements, grievances, assets, store_items, timetable, assignments, assignment_submissions, certificates, staff_leaves, disciplinary_records, fee_instalments, scholarships, attendance_condonation, institution_settings, users, payroll, academic_calendar, notifications, documents, dashboard_widgets, companies, placement_drives, placement_applications, training_programs, training_enrollments, fundraising_campaigns, donations, visitors

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

Enterprise-level sidebar with search, multicolor group indicators: Overview (blue), Academics (violet, incl. Hall Tickets, ID Cards, Training & Placement), People (emerald), Finance (amber, incl. Fundraising), Campus (cyan, incl. Visitors), Communication (pink, incl. Student Portal, Parent Portal, Notifications), Administration (orange, incl. Bulk Import/Export, Data Backup, Document Vault, Print Templates, Dashboard Settings) — each group is collapsible with color-coded dots, menu items are role-filtered by RBAC permissions, inline search filters across all modules

## Authentication & RBAC

- **Auth**: Session-based with Bearer tokens, bcrypt password hashing
- **Roles**: SuperAdmin, Admin, Principal, HOD, Faculty, Staff, Student
- **Permissions**: Module-level permissions per role (defined in `ROLE_PERMISSIONS` in `lib/db/src/schema/users.ts`)
- **SuperAdmin**: Full access to everything including user management
- **Admin**: All modules except cannot create SuperAdmin users
- **Frontend**: AuthProvider with `useAuth()` hook, `hasPermission()` / `hasRole()` helpers
- **Login**: `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`
- **Users API**: `/api/users` (CRUD, requires Admin+ role)
- **Token injection**: `setAuthTokenGetter()` from `@workspace/api-client-react` auto-attaches Bearer tokens to all generated API hooks
- **Default admin**: Seed via `POST /api/auth/seed-admin` (dev only), username: `admin`, password: `admin123`

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
