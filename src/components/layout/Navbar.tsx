import React from 'react';
import { Menu, LogOut, User as UserIcon, Shield, UserCheck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { StatusBadge } from '../common/StatusBadge';
import { getInitials } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { profile, role, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-6">
      {/* Left side: Mobile menu & App Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden focus:outline-none"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-md shadow-indigo-200 text-sm">
            DF
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-none">DAYFLOW</h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">HR Management System</p>
          </div>
        </div>
      </div>

      {/* Right side: User Profile, Role Badge, Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {profile && (
          <div className="hidden sm:flex items-center gap-2">
            <StatusBadge status={role || 'EMPLOYEE'} size="sm" />
          </div>
        )}

        <div className="flex items-center gap-3 border-l border-slate-200 pl-3 sm:pl-4">
          <div className="flex items-center gap-2.5">
            {profile?.profile_picture_url ? (
              <img
                src={profile.profile_picture_url}
                alt={profile.full_name}
                className="h-9 w-9 rounded-full object-cover border border-indigo-100 shadow-sm"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 font-semibold text-white text-xs shadow-sm shadow-indigo-200">
                {getInitials(profile?.full_name)}
              </div>
            )}

            <div className="hidden md:block text-left">
              <div className="text-sm font-semibold text-slate-800 leading-tight">
                {profile?.full_name || 'Loading user...'}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                {profile?.employee_id || ''}
              </div>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition focus:outline-none"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
