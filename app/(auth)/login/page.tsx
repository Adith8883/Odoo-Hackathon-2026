'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Eye, EyeOff, User, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { signIn } from '@/services/auth.service';
import type { UserRole } from '@/types/auth.types';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [portalRole, setPortalRole] = useState<UserRole>('employee');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);

    try {
      await signIn({
        email: data.email,
        password: data.password,
        portalRole,
      });

      toast.success('Signed in successfully', {
        description: `Entering ${portalRole === 'hr' ? 'HR Command Center' : 'Employee Portal'}...`,
      });

      if (portalRole === 'hr') {
        router.push('/hr/dashboard');
      } else {
        router.push('/employee/home');
      }
      router.refresh();
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-lg rounded-2xl bg-card">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
        <CardDescription className="text-xs">
          Select your portal and sign in to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-xs font-medium text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          {/* Portal / Role Selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Sign In As</Label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPortalRole('employee')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                  portalRole === 'employee'
                    ? 'border-primary bg-primary/10 ring-1 ring-primary text-foreground'
                    : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Employee</p>
                  <p className="text-[10px] text-muted-foreground">Self Portal</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPortalRole('hr')}
                className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                  portalRole === 'hr'
                    ? 'border-primary bg-primary/10 ring-1 ring-primary text-foreground'
                    : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">HR / Admin</p>
                  <p className="text-[10px] text-muted-foreground">Management</p>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              disabled={isLoading}
              className="rounded-xl"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={isLoading}
                className="rounded-xl pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full h-11 rounded-xl bg-primary font-semibold shadow-sm" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In to {portalRole === 'hr' ? 'HR Portal' : 'Employee Portal'}
          </Button>

          <div className="text-center space-y-2 pt-1">
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-primary transition-colors block"
            >
              Forgot password?
            </Link>
            <p className="text-xs text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="text-primary font-semibold hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
