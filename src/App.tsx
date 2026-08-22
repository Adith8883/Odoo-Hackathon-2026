import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';

// Employee Pages
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { Profile } from './pages/employee/Profile';
import { Attendance as EmployeeAttendance } from './pages/employee/Attendance';
import { LeaveRequests as EmployeeLeaveRequests } from './pages/employee/LeaveRequests';
import { Payroll as EmployeePayroll } from './pages/employee/Payroll';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Employees as AdminEmployees } from './pages/admin/Employees';
import { Attendance as AdminAttendance } from './pages/admin/Attendance';
import { LeaveRequests as AdminLeaveRequests } from './pages/admin/LeaveRequests';
import { Payroll as AdminPayroll } from './pages/admin/Payroll';

// Protected Route Component for Authenticated Users
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage label="Authenticating session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Strict Admin-Only Route Component
const AdminOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage label="Verifying administrative privileges..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role !== 'ADMIN') {
    return <Navigate to="/employee/dashboard" replace />;
  }

  return <>{children}</>;
};

// Smart Root Redirector
const RootRedirect: React.FC = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage label="Connecting to Dayflow..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/employee/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Root Route */}
            <Route path="/" element={<RootRedirect />} />

            {/* Employee Portal Routes */}
            <Route
              path="/employee"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/employee/dashboard" replace />} />
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="attendance" element={<EmployeeAttendance />} />
              <Route path="leave" element={<EmployeeLeaveRequests />} />
              <Route path="payroll" element={<EmployeePayroll />} />
            </Route>

            {/* Admin Portal Routes */}
            <Route
              path="/admin"
              element={
                <AdminOnlyRoute>
                  <DashboardLayout />
                </AdminOnlyRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="employees" element={<AdminEmployees />} />
              <Route path="attendance" element={<AdminAttendance />} />
              <Route path="leaves" element={<AdminLeaveRequests />} />
              <Route path="payroll" element={<AdminPayroll />} />
            </Route>

            {/* Fallback Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
