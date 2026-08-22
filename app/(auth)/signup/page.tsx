'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Eye, EyeOff, User, ShieldCheck, Check } from 'lucide-react';
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
import { signUp } from '@/services/auth.service';
import type { UserRole } from '@/types/auth.types';
import { toast } from 'sonner';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('employee');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    setError(null);

    try {
      await signUp({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        role: selectedRole,
      });

      toast.success('Account Created!', {
        description: `Welcome to Dayflow as ${selectedRole === 'hr' ? 'HR Administrator' : 'Employee'}.`,
      });

      // Navigate to appropriate role portal
      if (selectedRole === 'hr') {
        router.push('/hr/dashboard');
      } else {
        router.push('/employee/home');
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-border/60 shadow-lg rounded-2xl bg-card">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
        <CardDescription className="text-xs">
          Select your account role and enter your details to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-xs font-medium text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          {/* Role Switcher Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Choose Your Role</Label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedRole('employee')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  selectedRole === 'employee'
                    ? 'border-primary bg-primary/10 ring-1 ring-primary text-foreground'
                    : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <User className="w-4 h-4" />
                  </div>
                  {selectedRole === 'employee' && (
                    <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-xs font-bold text-foreground">Employee</p>
                  <p className="text-[10px] text-muted-foreground">Self-service & pulse</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('hr')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  selectedRole === 'hr'
                    ? 'border-primary bg-primary/10 ring-1 ring-primary text-foreground'
                    : 'border-border/60 hover:bg-muted/40 text-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  {selectedRole === 'hr' && (
                    <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-xs font-bold text-foreground">HR / Admin</p>
                  <p className="text-[10px] text-muted-foreground">Approvals & control</p>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-xs font-semibold">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="e.g. Abhilash Abhi"
              autoComplete="name"
              disabled={isLoading}
              className="rounded-xl"
              {...register('fullName')}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
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
                placeholder="Create a strong password"
                autoComplete="new-password"
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

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-semibold">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              autoComplete="new-password"
              disabled={isLoading}
              className="rounded-xl"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full h-11 rounded-xl bg-primary font-semibold shadow-sm" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create {selectedRole === 'hr' ? 'HR Admin' : 'Employee'} Account
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-1">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-primary font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
