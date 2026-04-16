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