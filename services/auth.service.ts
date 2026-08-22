import { createClient } from '@/lib/supabase';
import type { LoginCredentials, SignupCredentials, AuthUser } from '@/types/auth.types';

export async function signIn({ email, password, portalRole }: LoginCredentials) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(error.message === 'Invalid login credentials' ? 'Incorrect email or password.' : error.message);
  }

  // If a portalRole was explicitly selected on the login page (e.g. HR Admin or Employee)
  if (data.user && portalRole) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle();

    // If profile exists and user selected a specific portal role, update profile if needed or ensure alignment
    if (profile && profile.role !== portalRole) {
      await supabase
        .from('profiles')
        .update({ role: portalRole })
        .eq('id', data.user.id);
    }
  }

  return data;
}

export async function signUp({ email, password, fullName, role = 'employee' }: SignupCredentials) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
    },
  });
  if (error) throw new Error(error.message);

  // If user signed up and session is created immediately, ensure profile has chosen role
  if (data.user) {
    await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName,
        role,
      })
      .select()
      .maybeSingle();

    if (role === 'employee') {
      await supabase
        .from('employees')
        .upsert({
          profile_id: data.user.id,
          employee_id: `EMP-${String(Date.now()).slice(-4)}`,
          department: 'Engineering',
          job_title: 'Software Engineer',
          joining_date: new Date().toISOString().split('T')[0],
          status: 'active',
        })
        .select()
        .maybeSingle();
    }
  }

  return data;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function resetPassword(email: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw new Error(error.message);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = createClient();

  // Get authenticated user from Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return null;

  // Try fetching profile row
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  // If no profile row yet, create one
  if (!profile) {
    const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Team Member';
    const role = user.user_metadata?.role || 'employee';

    const { data: newProfile } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: fullName,
        role,
      })
      .select()
      .maybeSingle();

    return {
      id: user.id,
      email: user.email || '',
      fullName: newProfile?.full_name || fullName,
      role: (newProfile?.role as 'employee' | 'hr') || 'employee',
      avatarUrl: newProfile?.avatar_url || undefined,
    };
  }

  return {
    id: user.id,
    email: user.email || '',
    fullName: profile.full_name || user.email?.split('@')[0] || 'Member',
    role: (profile.role as 'employee' | 'hr') || 'employee',
    avatarUrl: profile.avatar_url || undefined,
  };
}

export async function getSession() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
