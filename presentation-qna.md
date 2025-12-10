# SMA Presentation Q&A

Prepared prompts and concise answers you can reuse during the IT Project Management presentation.

## Project Overview

- **Q:** What problem does this system solve?  
  **A:** It is a School Management System (SMA) that centralizes admin, staff, and student workflows—attendance, classes, timetables, fees/salaries, feedback, and dashboards—so operations run from one web app instead of spreadsheets or scattered tools.

- **Q:** Who are the main users and what do they get?  
  **A:** Admins manage people, rooms, classes, fees/salaries, and review feedback; staff record attendance, view schedules, and salaries; students see timetables, marks, fees, and submit feedback.

## Architecture & Tech

- **Q:** What is the architecture?  
  **A:** A Next.js 16 App Router app with server routes under `src/app/api/*` and React client pages. Supabase provides the database and auth helpers; APIs use service classes (e.g., `AdminService`, `StudentService`) for data access and validation.

- **Q:** Why choose Supabase?  
  **A:** It gives managed Postgres, row-level security, and lightweight auth integration. This sped up delivery while keeping SQL flexibility for attendance, fee, and timetable tables.

- **Q:** How is state and UI built?  
  **A:** Modern React components with Tailwind (v4) utility classes and Radix UI primitives, keeping layouts consistent (shared `Navbar`/`Footer`) and forms accessible.

## Security & Access Control

- **Q:** How do you handle authentication and roles?  
  **A:** Login is via `/api/auth/login`; passwords are validated with `bcryptjs`, and JWT/session helpers route users to role-specific dashboards. Server-side guards ensure only admins hit admin APIs, and staff/students are limited to their own data.

- **Q:** What about data protection in transit/at rest?  
  **A:** All traffic assumes HTTPS; Supabase stores data encrypted at rest. Sensitive fields (password hashes) use bcrypt; tokens are HTTP-only; minimal PII is stored.

## Features & Data Flows

- **Q:** How does attendance recording work?  
  **A:** Staff call the staff attendance API; entries go to the `attendance` table with student, class, date, and status. Students see their own attendance via the student dashboard endpoints.

- **Q:** How are fees and salaries tracked?  
  **A:** Admin APIs read/write `student_fees` and `staff_salary` tables. Dashboards surface unpaid counts; staff can view salary status, students can see fee status and amounts.

- **Q:** How is feedback handled?  
  **A:** Students can submit categorized feedback (optionally anonymous). Admins list feedback with filters and can update status (pending/in_review/resolved) and priority (high/medium/low).

- **Q:** How are timetables and classes managed?  
  **A:** Admins define classes/rooms; staff/student schedules read from class and timetable tables. Services join enrollments to show each user only their classes.

## Quality, Ops, and PM

- **Q:** What resilience measures exist?  
  **A:** API layer uses `retrySupabaseQuery` for transient DB issues; service methods validate inputs (e.g., allowed statuses/priorities) before writes to avoid bad data.

- **Q:** How do you test or validate changes?  
  **A:** Local runs with `npm run dev` and linting via `npm run lint`. Manual scenario tests per role (login, dashboard, attendance, fee/salary views, feedback submission and status updates).

- **Q:** Deployment plan?  
  **A:** Build with `npm run build` and deploy to a Node-friendly host (e.g., Vercel). Environment variables carry Supabase keys/URLs; no secrets are baked into the client.

- **Q:** Key risks and mitigations?  
  **A:** Risk: role misconfiguration → mitigated by server-side guards. Risk: data consistency across tables (attendance/fees) → mitigated by scoped service methods and input validation. Risk: Supabase outage → mitigated by retries and clear error messaging; can add caching later.
