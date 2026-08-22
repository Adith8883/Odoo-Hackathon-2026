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
  Hexagon,
  MessageSquare,
  Calendar,
  FolderKanban,
  Megaphone,
} from 'lucide-react';
import type { UserRole } from '@/types/auth.types';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/routes';

interface SidebarProps {
  role: UserRole;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const employeeNav = [
    { label: 'Home', icon: Home, href: ROUTES.EMPLOYEE.HOME },
    { label: 'Attendance', icon: Clock, href: ROUTES.EMPLOYEE.ATTENDANCE },
    { label: 'Leave', icon: CalendarDays, href: ROUTES.EMPLOYEE.LEAVE },
    { label: 'Messages', icon: MessageSquare, href: ROUTES.EMPLOYEE.MESSAGES },
    { label: 'Meetings', icon: Calendar, href: ROUTES.EMPLOYEE.MEETINGS },
    { label: 'Groups', icon: FolderKanban, href: ROUTES.EMPLOYEE.GROUPS },
    { label: 'Payroll', icon: Wallet, href: ROUTES.EMPLOYEE.PAYROLL },
    { label: 'Profile', icon: User, href: ROUTES.EMPLOYEE.PROFILE },
  ];

  const hrNav = [
    { label: 'Dashboard', icon: LayoutDashboard, href: ROUTES.HR.DASHBOARD },
    { label: 'Employees', icon: Users, href: ROUTES.HR.EMPLOYEES },
    { label: 'Attendance', icon: Clock, href: ROUTES.HR.ATTENDANCE },
    { label: 'Leave', icon: CalendarDays, href: ROUTES.HR.LEAVE },
    { label: 'Messages', icon: MessageSquare, href: ROUTES.HR.MESSAGES },
    { label: 'Meetings', icon: Calendar, href: ROUTES.HR.MEETINGS },
    { label: 'Groups', icon: FolderKanban, href: ROUTES.HR.GROUPS },
    { label: 'Announcements', icon: Megaphone, href: ROUTES.HR.ANNOUNCEMENTS },
    { label: 'Payroll', icon: Wallet, href: ROUTES.HR.PAYROLL },
  ];

  const navItems = role === 'hr' ? hrNav : employeeNav;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-card md:flex">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Hexagon className="h-6 w-6 text-primary fill-primary/20" />
        <span className="text-xl font-bold text-foreground tracking-tight">Dayflow</span>
      </div>
      
      <div className="flex-1 overflow-auto py-6">
        <nav className="grid gap-1 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive 
                    ? "bg-accent text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t p-4 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Dayflow HR System
      </div>
    </aside>
  );
}
