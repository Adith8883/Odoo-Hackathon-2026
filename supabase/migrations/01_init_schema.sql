-- ==============================================================================
-- DAYFLOW: COMPLETE SUPABASE DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'hr')),
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. EMPLOYEES TABLE (Job Details)
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  employee_id TEXT UNIQUE NOT NULL, -- e.g. "EMP-001"
  department TEXT NOT NULL,
  job_title TEXT NOT NULL,
  joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_employee_profile UNIQUE(profile_id)
);

-- 3. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'half_day', 'leave')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_employee_daily_attendance UNIQUE (employee_id, date)
);

-- 4. LEAVE TYPES TABLE
CREATE TABLE IF NOT EXISTS public.leave_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  default_days INTEGER NOT NULL DEFAULT 12,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. LEAVE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL CHECK (total_days > 0),
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewer_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. PAYROLL TABLE
CREATE TABLE IF NOT EXISTS public.payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  base_salary NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  allowances NUMERIC(12,2) DEFAULT 0.00,
  benefits NUMERIC(12,2) DEFAULT 0.00,
  deductions NUMERIC(12,2) DEFAULT 0.00,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_employee_payroll UNIQUE (employee_id)
);

-- 7. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_employees_profile_id ON public.employees(profile_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON public.attendance(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON public.leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_payroll_employee ON public.payroll(employee_id);
CREATE INDEX IF NOT EXISTS idx_documents_employee ON public.documents(employee_id);

-- ==============================================================================
-- AUTOMATIC PROFILE TRIGGER ON SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_full_name TEXT;
  v_emp_count INT;
  v_emp_id TEXT;
BEGIN
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'employee');
  v_full_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));

  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, v_full_name, v_role);

  -- If employee role, automatically generate employee record
  IF v_role = 'employee' THEN
    SELECT COUNT(*) + 1 INTO v_emp_count FROM public.employees;
    v_emp_id := 'EMP-' || LPAD(v_emp_count::TEXT, 3, '0');

    INSERT INTO public.employees (profile_id, employee_id, department, job_title, joining_date, status)
    VALUES (
      new.id,
      v_emp_id,
      COALESCE(new.raw_user_meta_data->>'department', 'Engineering'),
      COALESCE(new.raw_user_meta_data->>'job_title', 'Software Engineer'),
      CURRENT_DATE,
      'active'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current authenticated user is HR
CREATE OR REPLACE FUNCTION public.is_hr()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'hr'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_hr());

CREATE POLICY "Users can update own non-protected fields" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "HR can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_hr());

-- EMPLOYEES POLICIES
CREATE POLICY "Employees can view own employee details" ON public.employees
  FOR SELECT USING (profile_id = auth.uid() OR public.is_hr());

CREATE POLICY "HR can manage all employees" ON public.employees
  FOR ALL USING (public.is_hr());

-- ATTENDANCE POLICIES
CREATE POLICY "Employees can view own attendance" ON public.attendance
  FOR SELECT USING (
    employee_id IN (SELECT id FROM public.employees WHERE profile_id = auth.uid())
    OR public.is_hr()
  );

CREATE POLICY "Employees can insert own check-in" ON public.attendance
  FOR INSERT WITH CHECK (
    employee_id IN (SELECT id FROM public.employees WHERE profile_id = auth.uid())
    OR public.is_hr()
  );

CREATE POLICY "Employees can update own check-out" ON public.attendance
  FOR UPDATE USING (
    employee_id IN (SELECT id FROM public.employees WHERE profile_id = auth.uid())
    OR public.is_hr()
  );

CREATE POLICY "HR can manage all attendance" ON public.attendance
  FOR ALL USING (public.is_hr());

-- LEAVE TYPES POLICIES
CREATE POLICY "Anyone authenticated can view leave types" ON public.leave_types
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "HR can manage leave types" ON public.leave_types
  FOR ALL USING (public.is_hr());

-- LEAVE REQUESTS POLICIES
CREATE POLICY "Employees can view own leave requests" ON public.leave_requests
  FOR SELECT USING (
    employee_id IN (SELECT id FROM public.employees WHERE profile_id = auth.uid())
    OR public.is_hr()
  );

CREATE POLICY "Employees can create leave requests" ON public.leave_requests
  FOR INSERT WITH CHECK (
    employee_id IN (SELECT id FROM public.employees WHERE profile_id = auth.uid())
  );

CREATE POLICY "HR can manage & review all leave requests" ON public.leave_requests
  FOR ALL USING (public.is_hr());

-- PAYROLL POLICIES
CREATE POLICY "Employees can view own payroll" ON public.payroll
  FOR SELECT USING (
    employee_id IN (SELECT id FROM public.employees WHERE profile_id = auth.uid())
    OR public.is_hr()
  );

CREATE POLICY "HR can manage all payroll" ON public.payroll
  FOR ALL USING (public.is_hr());

-- DOCUMENTS POLICIES
CREATE POLICY "Employees can view own documents" ON public.documents
  FOR SELECT USING (
    employee_id IN (SELECT id FROM public.employees WHERE profile_id = auth.uid())
    OR public.is_hr()
  );

CREATE POLICY "HR can manage all documents" ON public.documents
  FOR ALL USING (public.is_hr());

-- ==============================================================================
-- REALTIME PUBLICATION SETUP
-- ==============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'leave_requests') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_requests;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'attendance') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
  END IF;
END $$;
