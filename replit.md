# KalviCore - Complete Campus. One Intelligent System

## Overview
KalviCore is a comprehensive College Management System designed for all types of colleges (Engineering, Arts & Science, Medical, Polytechnic, Business Schools, Law, Agricultural). It aims to streamline administrative and academic operations, offering 42+ integrated modules covering student lifecycle, staff management, finance, campus facilities, laboratory management, sports/NCC/NSS activities, and advanced analytics. The system provides a unified platform to manage everything from admissions and attendance to exams, fees, and alumni relations, enhancing efficiency and communication within the college ecosystem. Its business vision is to be the leading college management solution in the region, offering a complete digital transformation for educational institutions.

## User Preferences
I prefer detailed explanations and clear communication. I want to be involved in major architectural decisions and approve them before implementation. I appreciate an iterative development approach with regular updates on progress. Do not make changes to files in the `lib/api-spec/` directory without explicit approval.

## System Architecture
The system is built as a monorepo using pnpm workspaces. The frontend is developed with React 19, Vite, Tailwind CSS, shadcn/ui for UI components, Recharts for data visualization, and Wouter for routing. The backend API is built using Express 5, with PostgreSQL as the database, managed by Drizzle ORM. Zod and drizzle-zod are used for validation, and Orval generates API client hooks and Zod schemas from an OpenAPI specification. The build process utilizes esbuild.

Key architectural decisions include:
- **Modular Design**: The system is broken down into 42+ distinct modules covering various aspects of college management, including Laboratory Management (labs, equipment, schedules) and Sports/NCC/NSS Management (activities, enrollments, achievements), ensuring maintainability and scalability.
- **Role-Based Access Control (RBAC)**: A robust RBAC system with roles like SuperAdmin, Admin, Principal, HOD, Faculty, and Student, ensures granular control over module access and data. Permissions are dynamically configurable and cached for performance.
- **Data-Driven UI**: Dashboard customization allows users to configure widget visibility and order, providing a personalized experience.
- **Print Templates**: A centralized system for generating 11 types of printable documents using dynamic institution data, ensuring consistent branding and information.
- **Student Batch Tracking**: Auto-calculated batch year ranges (e.g., "2024-2027" for 3-year Arts & Science, "2024-2028" for 4-year Engineering) based on admission date + course duration. Batch filter available in student list.
- **State Management**: The `InstitutionProvider` context manages institution-wide settings, refreshing dynamically when settings are updated.
- **UI/UX**: Focus on a clean, enterprise-level sidebar navigation with search, multicolor group indicators, and role-filtered menu items for intuitive user experience.
- **Tamil Nadu Specific Features**: Integrates local requirements such as community categories, specific scholarship tracking, Madurai Kamaraj University affiliation, and Razorpay payment gateway.

## External Dependencies
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Payment Gateway**: Razorpay (for fee collection)
- **UI Component Library**: shadcn/ui
- **Charting Library**: Recharts
- **OpenAPI Codegen**: Orval
- **Authentication**: bcrypt (for password hashing)

## Role-Based Data Scoping
All API endpoints enforce server-side role-based data scoping:
- **SuperAdmin/Admin/Principal**: Full access to all data across all departments
- **HOD**: Access limited to their own department's students, staff, timetable, attendance, exams, labs
- **Faculty**: Access to own department's students/attendance + own staff record, leaves, payroll
- **Staff (Office)**: Access to all operational data
- **Student**: Access restricted to own records only (attendance, fees, certificates, grades, library books, hostel allocation, transport, sports enrollments, placement applications)

Key implementation:
- `resolveUserContext()` in `auth.ts` middleware maps user email → staff/student DB record IDs
- `getUserScope()` in `scopeFilter.ts` provides role flags and scoped IDs
- All scoped routes require `requireAuth` middleware — unauthenticated access returns 401
- User emails in `users` table must match emails in `staff`/`students` tables for identity resolution

Test accounts: college_admin/Admin@123, principal/Principal@123, hod_cse/Hod@123, faculty_cse/Faculty@123, office_staff/Staff@123, student_cse/Student@123

## Authentication & Password Management
- **Login Page**: Role-based dropdown (Admin, Principal, HOD, Faculty, Staff, Student, Parent). Username field label changes dynamically — "Staff ID" for staff roles, "Roll Number" for Students, "Parent ID" for Parents.
- **Auto-Generated Passwords**: When admin creates a user, password is auto-generated (10 chars with upper, lower, digits, special). The generated password is shown to the admin and logged for email delivery. No manual password entry during user creation.
- **First-Login Password Change**: New users have `mustChangePassword=true`. On login, they see a "Change Your Password" screen before accessing the system. After changing, they are logged in normally.
- **Forgot Password**: Login page has "Forgot Password?" link → enter email → generates a reset token (valid 1 hour). Reset token logged to server console for email delivery.
- **Admin Password Reset**: Users page has a key icon button per user to reset their password. Generates new auto-password and sets `mustChangePassword=true`.
- **DB columns**: `must_change_password` (boolean), `reset_token` (text), `reset_token_expiry` (timestamp) on users table.

## Frontend Role-Based Views
Student-facing pages show simplified, read-only UIs:
- **Hostels** (`hostels.tsx`): Students see "My Hostel" with only "My Allocation" and "My Complaints" tabs (can file complaints with auto-populated studentId). Admin sees all 4 tabs with full CRUD.
- **Transport** (`transport.tsx`): Students see "My Transport" with only "My Allocation" tab. Admin sees all 4 tabs (Routes/Vehicles/Stops/Allocations).
- **Library** (`library.tsx`): Students see "Library" with read-only Catalog (no add/delete) and "My Books" tab (own issued books only, no issue/return buttons). Admin sees full "Library Management" with all CRUD actions.
- **Dashboard** (`dashboard.tsx`): Students see personalized "Welcome, {name}!" with roll number, semester, attendance %, fees paid cards, profile details, and circular attendance chart. Admin sees full overview with department stats, fee collection, and recent activity.
- **Timetable** (`timetable.tsx`): Students see "My Timetable" read-only day×period grid with subject code, staff, room, and time. No add/edit/delete controls. Admin sees full list with add/delete capabilities.
- **Exams** (`exams.tsx`): Students see "My Examinations" with upcoming and completed exam cards (read-only, no tabs for results/analytics). Admin sees full tabs: Schedule, Results Management, Analytics.
- **Hall Tickets** (`hall-tickets.tsx`): Students see "My Hall Ticket" with auto-selected student (from auth context) and only exam picker. Admin sees full student search + exam picker.
- **Attendance** (`attendance.tsx`): Students see "My Attendance" with overall %, subject-wise breakdown with progress bars and shortage warnings. No Mark Attendance, Records, Condonation tabs. Admin sees all 4 tabs with full CRUD.
- **Fees** (`fees.tsx`): Students see "My Fees" with total fee/paid/due cards, Razorpay online payment button, and payment history. No admin tabs (Fee Structures, Instalments, Defaulters, Scholarships). Admin sees all 6 tabs.
- **Notifications** (`notifications.tsx`): Students see "Noticeboard & Notifications" with two tabs — **Noticeboard** (default, shows active college announcements with priority/type badges) and **My Notifications** (personal notification feed). No compose/send button, no stats dashboard. Admin/staff see full Notification Center with compose dialog and stats. The compose dialog now offers a **"Use Template"** dropdown that loads any active template for the chosen channel into Subject + Body.
- **Notification Templates** (`notification-templates.tsx`, route `/notification-templates`): Library of pre-built WhatsApp/Email/SMS messages with `{{variable}}` placeholders. 65 system templates seeded across 13 categories (Academic, Attendance, Fees, Admission, Library, Hostel, Transport, Placement, Event, Administrative, Emergency, Staff, Account). Backed by `notification_templates` table (`lib/db/src/schema/notificationTemplates.ts`). API: `GET/POST/PATCH/DELETE /api/notification-templates`, plus `POST /api/notification-templates/seed` to re-import any missing system templates. System templates are read-only (cannot be deleted, only disabled). Custom templates support full CRUD with auto-detected variables. Seeding runs on API server startup via `seedSystemTemplatesOnStartup()` from `notificationTemplates.ts`.
- **Parent Portal** (`parent-portal.tsx`): Standalone portal. Login with username + password (same credentials as main system). Sidebar: Dashboard, Noticeboard, Student Info, Fee Payments, Exam Results. Green theme.
- **Librarian Portal** (`librarian-portal.tsx`): Standalone portal. Login with username + password (same credentials as main system). Sidebar: Dashboard (stats), Book Catalog (search), Issued Books. Amber/orange theme.
- **Hostel Warden Portal** (`warden-portal.tsx`): Standalone portal. Login with username + password (same credentials as main system). Sidebar: Dashboard (stats), Hostels, Rooms, Allocations, Complaints. Indigo/violet theme.
- **Transport Manager Portal** (`transport-portal.tsx`): Standalone portal. Login with username + password (same credentials as main system). Sidebar: Dashboard (stats), Routes, Vehicles, Stops, Allocations. Cyan/teal theme.
- **Faculty Sidebar**: Faculty role sees focused sidebar with 5 groups: Overview (Dashboard, Calendar), Teaching (Subjects, Timetable, Assignments, Exams, Lab), My Students (Students, Attendance, Sports), Staff (My Leaves), Communication (Events, Communications, Notifications).
- All portals accessible from login page "Portals" section without main auth. Backend routes: `/api/staff-portal/login` (shared staff login), `/api/librarian-portal/*`, `/api/warden-portal/*`, `/api/transport-portal/*`.
- Pattern: `const { user } = useAuth(); const isStudent = user?.role === "Student";` — conditionally render tabs, buttons, and table columns.

## Backend Security
- Timetable write endpoints (POST/PATCH/DELETE) require authentication and block students (403)
- Hall ticket endpoints enforce IDOR protection: students can only access their own hall ticket (studentId === scope.studentRecordId)
- Dashboard student-summary endpoint scoped to authenticated student's own record only
- Razorpay create-order and verify-payment endpoints require authentication; student IDOR check prevents paying for other students
- Attendance student view renders independently without triggering admin-level API calls (overview, department lists)