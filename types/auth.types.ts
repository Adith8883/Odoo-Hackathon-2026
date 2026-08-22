export type UserRole = 'employee' | 'hr';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  portalRole?: UserRole;
}

export interface SignupCredentials {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
}
