-- ==============================================================================
-- DAYFLOW: SEED DATA SCRIPT
-- ==============================================================================

-- 1. Insert Leave Types
INSERT INTO public.leave_types (id, name, description, default_days, is_active)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Paid Leave', 'Annual vacation and personal paid time off', 18, true),
  ('22222222-2222-2222-2222-222222222222', 'Sick Leave', 'Medical leave for recovery and health appointments', 12, true),
  ('33333333-3333-3333-3333-333333333333', 'Unpaid Leave', 'Time off without compensation', 10, true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  default_days = EXCLUDED.default_days;

-- Note for Hackathon / Setup:
-- When you create your first user in Supabase Auth (e.g. sarah.johnson@dayflow.com):
-- UPDATE public.profiles SET role = 'hr' WHERE email = 'sarah.johnson@dayflow.com';
