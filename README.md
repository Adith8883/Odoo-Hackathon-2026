# Dayflow — Human Resource Management System

> **Every workday, perfectly aligned.**

Dayflow is a modern, role-based Human Resource Operating System designed with a mobile-first philosophy, built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, and **Supabase (Auth, PostgreSQL, RLS, Storage & Realtime)**.

---

## 🌟 Key Features

### 👤 Employee Experience
- **Daily Work Companion Home**: Real-time greeting, today's status, interactive check-in/check-out, 7-day weekly attendance strip, and leave balance summary.
- **Attendance & Shifts**: One-tap check-in/out with duplicate prevention, timestamp logging, duration tracking, and filterable history timeline.
- **Leave Management**: View available quotas across leave types (Paid, Sick, Unpaid), interactive application modal with automatic duration calculations, status pills, and HR review feedback notes.
- **Compensation & Payroll**: Confidential, read-only monthly salary breakdown, allowances, benefits, deductions, and estimated Annual CTC in Indian Rupees (₹).
- **Personal Profile**: Avatar upload with Supabase Storage, self-managed contact information editing, and HR-locked organizational parameters.

### 👔 HR & Administration Command Center
- **Executive Dashboard**: Organization metrics (Total Headcount, Present Today, On Leave, Pending Approvals), attendance progress meters, and pending requests queue.
- **Employee Directory**: Search by name, ID, or email; filter by department and active status; deep-dive into comprehensive profile sheets with job history and salary structure.
- **Leave Review & Workflow**: One-click approve/reject actions with reviewer comment capability and instant realtime sync to the employee's screen.
- **Company Attendance Matrix**: Real-time overview of workforce attendance with daily/weekly filters and status breakdown.
- **Payroll Management**: Full salary structure editor with dynamic recalculation of monthly net and annual CTC.

### ⚡ Realtime Architecture
- Instant synchronization using **Supabase Realtime** when HR approves or rejects leave requests.
- Live updates without requiring manual browser refreshes.

### 🔒 Enterprise Security & Row Level Security (RLS)
- Supabase Auth + JWT cookie sessions.
- PostgreSQL Row Level Security (RLS) on all tables (`profiles`, `employees`, `attendance`, `leave_requests`, `payroll`, `documents`).
- Role-based route middleware protecting `/hr/*` and `/employee/*` endpoints.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- A [Supabase](https://supabase.com) project

### 2. Environment Variables
Create or update `.env.local` in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Database & RLS Setup
Run the SQL schema migration in your Supabase SQL Editor:
1. Open your **Supabase Dashboard** → **SQL Editor**.
2. Copy and execute the contents of [`supabase/migrations/01_init_schema.sql`](file:///d:/AI%20TRAVEL%20PLANER/HR%20EMPLOYEE%20MANAGEMENT/supabase/migrations/01_init_schema.sql).
3. Copy and execute the leave types seed in [`supabase/seed.sql`](file:///d:/AI%20TRAVEL%20PLANER/HR%20EMPLOYEE%20MANAGEMENT/supabase/seed.sql).

### 4. Create HR Admin User
1. Sign up a new user (e.g. `sarah.johnson@dayflow.com`) via the signup screen.
2. In your Supabase SQL Editor, promote this user to the `hr` role:
```sql
UPDATE public.profiles SET role = 'hr' WHERE email = 'sarah.johnson@dayflow.com';
```

### 5. Run the Application
```bash
# Start development server
npm run dev

# Or build and run production server
npm run build
npm start
```
Visit [http://localhost:3000](http://localhost:3000).

---

## 📁 Architecture Overview

```text
app/
├── (auth)/
│   ├── login/
│   ├── signup/
│   ├── forgot-password/
│   └── verify/
├── employee/
│   ├── home/
│   ├── attendance/
│   ├── leave/
│   ├── payroll/
│   └── profile/
└── hr/
    ├── dashboard/
    ├── employees/
    ├── attendance/
    ├── leave/
    └── payroll/

components/
├── ui/              # shadcn/ui primitives
├── layout/          # AppShell, Header, Sidebar, MobileNav
├── employee/        # Employee experience widgets
└── hr/              # HR management widgets & dialogs

services/            # Data access & Supabase interaction layer
hooks/               # State & realtime management hooks
lib/                 # Supabase client, storage, realtime utils
types/               # TypeScript data definitions
utils/               # Date, currency, formatter & validation helpers
supabase/            # SQL migrations and seed data
```
