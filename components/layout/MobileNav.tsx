'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Clock,
  CalendarDays,
  User,
  LayoutDashboard,
  Users,
  Wallet,
  MessageSquare,
  Calendar,
} from 'lucide-react';
import type { UserRole } from '@/types/auth.types';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';

interface MobileNavProps {
  role: UserRole;
}

export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();

  const employeeNav = [
    { label: 'Home', icon: Home, href: ROUTES.EMPLOYEE.HOME },
    { label: 'Leave', icon: CalendarDays, href: ROUTES.EMPLOYEE.LEAVE },
    { label: 'Messages', icon: MessageSquare, href: ROUTES.EMPLOYEE.MESSAGES },
    { label: 'Meetings', icon: Calendar, href: ROUTES.EMPLOYEE.MEETINGS },
    { label: 'Profile', icon: User, href: ROUTES.EMPLOYEE.PROFILE },
  ];

  const hrNav = [
    { label: 'Dashboard', icon: LayoutDashboard, href: ROUTES.HR.DASHBOARD },
    { label: 'Employees', icon: Users, href: ROUTES.HR.EMPLOYEES },
    { label: 'Messages', icon: MessageSquare, href: ROUTES.HR.MESSAGES },
    { label: 'Meetings', icon: Calendar, href: ROUTES.HR.MEETINGS },
    { label: 'Payroll', icon: Wallet, href: ROUTES.HR.PAYROLL },
  ];

  const navItems = role === 'hr' ? hrNav : employeeNav;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t bg-background md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-full h-full text-xs font-medium transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
