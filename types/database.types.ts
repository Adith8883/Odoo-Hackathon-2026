export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'employee' | 'hr';
          avatar_url: string | null;
          phone: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: 'employee' | 'hr';
          avatar_url?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'employee' | 'hr';
          avatar_url?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      employees: {
        Row: {
          id: string;
          profile_id: string;
          employee_id: string;
          department: string;
          job_title: string;
          joining_date: string;
          status: 'active' | 'inactive' | 'on_leave';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          employee_id: string;
          department: string;
          job_title: string;
          joining_date?: string;
          status?: 'active' | 'inactive' | 'on_leave';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          employee_id?: string;
          department?: string;
          job_title?: string;
          joining_date?: string;
          status?: 'active' | 'inactive' | 'on_leave';
          created_at?: string;
          updated_at?: string;
        };
      };
      attendance: {
        Row: {
          id: string;
          employee_id: string;
          date: string;
          check_in: string | null;
          check_out: string | null;
          status: 'present' | 'absent' | 'half_day' | 'leave';
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          date?: string;
          check_in?: string | null;
          check_out?: string | null;
          status?: 'present' | 'absent' | 'half_day' | 'leave';
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          date?: string;
          check_in?: string | null;
          check_out?: string | null;
          status?: 'present' | 'absent' | 'half_day' | 'leave';
          notes?: string | null;
          created_at?: string;
        };
      };
      leave_types: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          default_days: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          default_days?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          default_days?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      leave_requests: {
        Row: {
          id: string;
          employee_id: string;
          leave_type_id: string;
          start_date: string;
          end_date: string;
          total_days: number;
          reason: string | null;
          status: 'pending' | 'approved' | 'rejected';
          reviewed_by: string | null;
          reviewer_comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          leave_type_id: string;
          start_date: string;
          end_date: string;
          total_days: number;
          reason?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          reviewed_by?: string | null;
          reviewer_comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          leave_type_id?: string;
          start_date?: string;
          end_date?: string;
          total_days?: number;
          reason?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          reviewed_by?: string | null;
          reviewer_comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payroll: {
        Row: {
          id: string;
          employee_id: string;
          base_salary: number;
          allowances: number;
          benefits: number;
          deductions: number;
          effective_from: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          base_salary?: number;
          allowances?: number;
          benefits?: number;
          deductions?: number;
          effective_from?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          base_salary?: number;
          allowances?: number;
          benefits?: number;
          deductions?: number;
          effective_from?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          employee_id: string;
          name: string;
          file_url: string;
          file_type: string | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          name: string;
          file_url: string;
          file_type?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          name?: string;
          file_url?: string;
          file_type?: string | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
