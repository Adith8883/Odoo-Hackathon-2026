'use client';
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Header } from './Header';
import type { UserRole } from '@/types/auth.types';

interface AppShellProps {
  children: ReactNode;
  role: UserRole;
}

export function AppShell({ children, role }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar role={role} />
      <div className="md:ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 pb-20 md:pb-6 px-4 md:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
      <MobileNav role={role} />
    </div>
  );
}
