import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, CheckCircle, Info } from 'lucide-react';
import { authService } from '../../services/authService';
import { profileService } from '../../services/profileService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { refreshProfile } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const { user } = await authService.signIn(email, password);
      if (user) {
        // Fetch user profile to determine role
        const profile = await profileService.getProfile(user.id);
        await refreshProfile();
        showSuccess('Welcome back to Dayflow!');

        if (profile?.role === 'ADMIN') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/employee/dashboard', { replace: true });
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      showError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 font-extrabold text-white text-2xl shadow-xl shadow-indigo-200 mb-4">
          DF
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          DAYFLOW HRMS
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Human Resource & Attendance Management Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/60 rounded-3xl sm:px-10 border border-slate-100">
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Work Email
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50/40 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-semibold text-indigo-600 hover:text-indigo-500 transition underline underline-offset-2"
              >
                Register as Employee
              </Link>
            </p>
          </div>

          {/* Quick Demo Info Box */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <div className="rounded-2xl bg-indigo-50/70 p-3.5 border border-indigo-100/80 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-semibold text-indigo-900 mb-1.5">
                <Info className="w-4 h-4 text-indigo-600" />
                <span>Demo Access Information</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600 pl-5 list-disc">
                <li>
                  <strong className="text-slate-800">Admin Account:</strong> admin@dayflow.com
                </li>
                <li>
                  <strong className="text-slate-800">Employee Account:</strong> employee@dayflow.com
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
