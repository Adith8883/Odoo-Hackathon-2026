# Dayflow – Human Resource Management System (HRMS)

DAYFLOW is a modern, full-stack Human Resource Management System (HRMS) MVP engineered with **React**, **TypeScript**, **Vite**, **Tailwind CSS**, and powered by **Supabase** (PostgreSQL, Row Level Security, Auth, and Storage).

Designed with a high-end SaaS aesthetic, Dayflow delivers a seamless experience for both enterprise administrators and employees—enabling secure attendance tracking, automated salary calculation, leave request workflows, and profile management.

---

## 1. Project Overview
Dayflow solves core HR operational needs:
- **Zero Mock Data / Real Database**: Fully connected to Supabase PostgreSQL with strict Row Level Security (RLS) policies.
- **Secure Dual-Role Authorization**: Dedicated role-guarded portals for **Admin / HR** and **Employees**.
- **Real-Time Attendance**: One-click check-in and check-out with automatic duplicate-punch prevention.
- **Leave Request Management**: Multi-category leave application pipeline with real-time approval/rejection and administrative commentary.
- **Automated Payroll**: Base pay, allowance, and deduction management with automatic net salary computation.
- **Modern UI/UX**: Designed with Tailwind CSS, Lucide icons, responsive sidebar navigation, and interactive charts.

---

## 2. Features Breakdown

### 🧑‍💼 Employee Portal
- **Dashboard**: Quick glance at today's check-in status, recorded hours, leave counts, net salary, and recent attendance/leave activities.
- **My Profile**: View personal and organizational details, edit contact information (phone, address), and upload profile avatars to Supabase Storage.
- **Attendance Punch Clock**: Daily check-in/out button with automatic disabling after punches and complete chronological attendance history.
- **Leave Management**: Submit Paid, Sick, or Unpaid leave applications with date range validation and monitor approval status with admin comments.
- **Salary & Payroll**: Detailed breakdown of basic salary, allowances, deductions, and calculated net monthly earnings.

### 🛡️ Admin / HR Portal
- **Admin Dashboard**: Real-time KPI cards (Total Headcount, Present Today, Pending Approvals, Total Monthly Payroll) and Departmental Headcount chart.
- **Employee Directory**: Searchable and filterable employee table (search by name, ID, or department) with profile detail modal and administrative profile editor.
- **System-Wide Attendance**: Master attendance log with granular filters by individual employee, specific date, and status (`PRESENT`, `HALF_DAY`, `LEAVE`, `ABSENT`).
- **Leave Approval Inbox**: Review pending leave applications, approve or reject requests with custom admin comments.
- **Payroll Management**: Interactive salary configurator to modify base pay, allowances, and statutory deductions with live client and database net salary computation.

---

## 3. Technology Stack

- **Frontend Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 5](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Routing**: [React Router 6](https://reactrouter.com/)
- **Backend & Database**: [Supabase](https://supabase.com/)
  - Supabase Auth (Email / Password authentication)
  - PostgreSQL Relational Database
  - Row Level Security (RLS)
  - Supabase Storage (Public bucket for profile avatars)

---

## 4. System Architecture

```
                                  +---------------------------------------+
                                  |         React + Vite Frontend         |
                                  |  (Role-Guarded Routes & SaaS Layout)  |
                                  +-------------------+-------------------+
                                                      |
                                                      | @supabase/supabase-js
                                                      v
                                  +---------------------------------------+
                                  |            Supabase Cloud             |
                                  +---------------------------------------+
                                  | • Supabase Auth (JWT & Sessions)      |
                                  | • PostgreSQL Database + RLS Policies  |
                                  | • Triggers (Auto-Profile, Net Salary) |
                                  | • Storage Buckets ('avatars')         |
                                  +---------------------------------------+
```

---

## 5. Database Design & Security

### Tables & Schema
1. **`profiles`**
   - `id`: UUID (Primary Key, references `auth.users(id)` ON DELETE CASCADE)
   - `employee_id`: VARCHAR(30) UNIQUE NOT NULL
   - `full_name`: VARCHAR(100) NOT NULL
   - `email`: VARCHAR(150)
   - `phone`: VARCHAR(20)
   - `address`: TEXT
   - `job_title`: VARCHAR(100)
   - `department`: VARCHAR(100)
   - `joining_date`: DATE DEFAULT CURRENT_DATE
   - `profile_picture_url`: TEXT
   - `role`: VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE' (`EMPLOYEE` | `ADMIN`)
   - `created_at`: TIMESTAMPTZ DEFAULT NOW()

2. **`attendance`**
   - `id`: BIGINT (Primary Key, Identity)
   - `employee_id`: UUID (Foreign Key references `profiles(id)` ON DELETE CASCADE)
   - `attendance_date`: DATE NOT NULL DEFAULT CURRENT_DATE
   - `check_in`: TIMESTAMPTZ
   - `check_out`: TIMESTAMPTZ
   - `status`: VARCHAR(20) DEFAULT 'PRESENT' (`PRESENT` | `ABSENT` | `HALF_DAY` | `LEAVE`)
   - Constraint: `UNIQUE(employee_id, attendance_date)`

3. **`leave_requests`**
   - `id`: BIGINT (Primary Key, Identity)
   - `employee_id`: UUID (Foreign Key references `profiles(id)` ON DELETE CASCADE)
   - `leave_type`: VARCHAR(20) NOT NULL (`PAID` | `SICK` | `UNPAID`)
   - `start_date`: DATE NOT NULL
   - `end_date`: DATE NOT NULL
   - `remarks`: TEXT
   - `status`: VARCHAR(20) DEFAULT 'PENDING' (`PENDING` | `APPROVED` | `REJECTED`)
   - `admin_comment`: TEXT
   - `created_at`: TIMESTAMPTZ DEFAULT NOW()

4. **`payroll`**
   - `id`: BIGINT (Primary Key, Identity)
   - `employee_id`: UUID UNIQUE (Foreign Key references `profiles(id)` ON DELETE CASCADE)
   - `basic_salary`: NUMERIC(12,2) DEFAULT 0.00
   - `allowances`: NUMERIC(12,2) DEFAULT 0.00
   - `deductions`: NUMERIC(12,2) DEFAULT 0.00
   - `net_salary`: NUMERIC(12,2) DEFAULT 0.00
   - `updated_at`: TIMESTAMPTZ DEFAULT NOW()

### Database Functions & Triggers
- **`is_admin(user_uid)`**: Security Definer function that determines if the caller has the `ADMIN` role without recursive policy loops.
- **`handle_new_user()`**: Trigger on `auth.users` insert that creates a `profiles` record and a default `payroll` entry upon registration.
- **`calculate_net_salary()`**: Trigger on `payroll` insert/update that automatically calculates `net_salary = basic_salary + allowances - deductions`.

### Row Level Security (RLS) Policies
- **`profiles`**: Employees can only read/update their own profile (phone, address, avatar). Admins can read and update all profile records.
- **`attendance`**: Employees can only read, insert, and update checkout for their own attendance. Admins can view and manage all attendance logs.
- **`leave_requests`**: Employees can read and insert their own leave applications. Only Admins can approve/reject and edit admin comments.
- **`payroll`**: Employees have read-only access to their own payroll record. Only Admins have INSERT and UPDATE privileges.
- **Storage (`avatars` bucket)**: Public read access; authenticated users can upload and update their profile photos.

---

## 6. Supabase Setup Guide (Step-by-Step)

### Step 1: Create a Supabase Project
1. Log in to [Supabase](https://supabase.com/) and click **New Project**.
2. Set your Project Name (e.g., `Dayflow-HRMS`), choose a database password, and select your preferred region.

### Step 2: Run Database Migration Script
1. In your Supabase Dashboard, navigate to the **SQL Editor** tab from the left sidebar.
2. Click **New Query**.
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql` from this repository.
4. Paste it into the SQL editor and click **Run**.
5. Verify that tables (`profiles`, `attendance`, `leave_requests`, `payroll`), functions, triggers, and storage bucket are successfully created.

### Step 3: Disable Email Confirmation (Recommended for Quick Demo)
1. Go to **Authentication** -> **Providers** -> **Email**.
2. Uncheck **"Confirm email"** and click **Save**. This allows newly registered users to sign in immediately without waiting for confirmation emails.

---

## 7. Environment Variables Setup

Create a `.env` file in the project root by copying `.env.example`:

```bash
cp .env.example .env
```

Fill in your Supabase project credentials (found in **Project Settings -> API** in Supabase):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

---

## 8. Installation & Running

```bash
# 1. Clone or navigate to the project directory
cd dayflow-hrms

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build for production
npm run build
```

The application will be accessible at `http://localhost:3000`.

---

## 9. Demo Accounts Setup

### Option A: Create Users via the Signup Page
1. Open the application at `/signup`.
2. Register an employee account (e.g. `employee@dayflow.com`, Password: `Password123!`, ID: `EMP-1001`).
3. Register an admin account (e.g. `admin@dayflow.com`, Password: `Password123!`, ID: `ADM-0001`).
4. To grant `admin@dayflow.com` administrative privileges, run this single SQL command in the Supabase SQL Editor:
   ```sql
   UPDATE public.profiles
   SET role = 'ADMIN'
   WHERE email = 'admin@dayflow.com';
   ```

### Option B: Quick Demo Seed SQL
You can also run sample inserts directly in Supabase SQL Editor after creating the users in Supabase Auth.

---

## 10. Complete Testing Checklist

### 🔐 Authentication & Security
- [x] Public signup creates accounts with `EMPLOYEE` role only.
- [x] Role promotion to `ADMIN` is strictly controlled via database script.
- [x] Employees attempting to navigate to `/admin/*` are automatically redirected.
- [x] Unauthenticated users are redirected to `/login`.
- [x] Sign out terminates session and clears user state.

### 👤 Employee Portal
- [x] Dashboard loads real database metrics and recent history.
- [x] Daily Check In marks `PRESENT` timestamp and disables Check In button.
- [x] Daily Check Out marks timestamp and completes attendance.
- [x] Duplicate check-ins on the same calendar day are prevented.
- [x] Profile updates for phone and address save properly.
- [x] Avatar photo uploads to Supabase Storage and updates profile URL.
- [x] Leave application submits with start/end date validation.
- [x] Payroll view displays clear base salary, allowances, deductions, and net pay.

### 🛡️ Admin Portal
- [x] Dashboard shows company-wide headcount, present count, pending leaves, and total payroll budget.
- [x] Recharts visualization displays departmental employee distribution.
- [x] Employee directory search filters across names, IDs, and departments.
- [x] Admin can edit designations, departments, contact info, and roles.
- [x] Attendance management logs all personnel punches with employee, date, and status filters.
- [x] Leave requests can be approved or rejected with optional admin feedback.
- [x] Admin can update salary structures with automatic net salary recalculation.

---

## 11. Future Enhancements
- Automated PDF Salary Slip generator.
- Real-time Webhook & Email notifications on leave status changes.
- Shift scheduling and overtime tracking.
- Multi-currency payroll localization.

---

## 12. License & Author
- **Project**: Dayflow Human Resource Management System
- **License**: MIT
