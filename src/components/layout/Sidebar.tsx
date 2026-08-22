import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  CalendarCheck,
  CalendarRange,
  DollarSign,
  Users,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/helpers';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role, isAdmin } = useAuth();

  const employeeLinks = [
    { name: 'Dashboard', path: '/employee/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/employee/profile', icon: User },
    { name: 'Attendance', path: '/employee/attendance', icon: CalendarCheck },
    { name: 'Leave Requests', path: '/employee/leave', icon: CalendarRange },
    { name: 'My Payroll', path: '/employee/payroll', icon: DollarSign },
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Employee Directory', path: '/admin/employees', icon: Users },
    { name: 'All Attendance', path: '/admin/attendance', icon: CalendarCheck },
    { name: 'Leave Approvals', path: '/admin/leaves', icon: CalendarRange },
    { name: 'Payroll Management', path: '/admin/payroll', icon: DollarSign },
  ];

  const navLinks = isAdmin ? adminLinks : employeeLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-sm shadow-indigo-200 text-sm">
              DF
            </div>
            <div>
              <span className="text-lg font-extrabold text-slate-900">DAYFLOW</span>
              <span className="ml-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                HRMS
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {isAdmin ? 'ADMINISTRATION' : 'EMPLOYEE PORTAL'}
          </div>
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={cn(
                          'h-5 w-5 transition-colors',
                          isActive
                            ? 'text-white'
                            : 'text-slate-400 group-hover:text-slate-600'
                        )}
                      />
                      <span>{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info box */}
        <div className="p-4 border-t border-slate-100">
          <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 border border-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-700">Dayflow v1.0 MVP</p>
              <p className="text-[10px] text-slate-400">Connected to Supabase</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
