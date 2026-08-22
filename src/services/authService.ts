import { supabase } from '../lib/supabase';
import { Profile } from '../types/database';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  employeeId: string;
  phone?: string;
  address?: string;
  jobTitle?: string;
  department?: string;
}

export const authService = {
  async signUp(data: SignUpData) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          employee_id: data.employeeId,
          full_name: data.fullName,
          phone: data.phone || '',
          address: data.address || '',
          job_title: data.jobTitle || 'Staff Associate',
          department: data.department || 'General',
          role: 'EMPLOYEE', // Security rule: Public signup always creates EMPLOYEE accounts
        },
      },
    });

    if (authError) {
      throw new Error(authError.message);
    }

    return authData;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  async getCurrentSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw new Error(error.message);
    }
    return data.session;
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      return null;
    }
    return data.user;
  },
};
