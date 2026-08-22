'use client';

import { motion } from 'framer-motion';
import { getGreeting, formatDate } from '@/utils/date';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, Clock, ArrowUpRight, User } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

interface GreetingHeaderProps {
  employee?: any;
}

export function GreetingHeader({ employee }: GreetingHeaderProps) {
  const greeting = getGreeting();
  const today = formatDate(new Date(), 'EEEE, d MMMM yyyy');
  const name =
    employee?.profile?.full_name ||
    employee?.full_name ||
    (employee?.first_name ? `${employee.first_name} ${employee.last_name || ''}` : 'Team Member');

  const empId = employee?.employee_id || employee?.employee_code || 'EMP-001';
  const dept = employee?.department?.name || employee?.department || 'Engineering';
  const roleTitle = employee?.job_title || 'Software Engineer';
  const status = employee?.status || 'active';

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-7 shadow-sm"
    >
      {/* Subtle decorative glow */}
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* Left: Greeting & Identity */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5 bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              Workday Companion
            </span>
            <Badge variant="outline" className="font-mono text-[11px] px-2 py-0.5 border-border/80">
              {empId}
            </Badge>
            <Badge
              className={`text-[11px] px-2.5 py-0.5 capitalize ${
                status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
              }`}
              variant="outline"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              {String(status).replace('_', ' ')}
            </Badge>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {greeting}, <span className="bg-gradient-to-r from-primary via-indigo-600 to-primary bg-clip-text text-transparent">{name}</span> 👋
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
              <span>{roleTitle} • {dept}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-foreground/80 font-medium">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                {today}
              </span>
            </p>
          </div>
        </div>

        {/* Right: Quick Navigation Badges & Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href={ROUTES.EMPLOYEE.PAYROLL}>
            <Button size="sm" variant="outline" className="h-9 text-xs gap-1.5 border-border/80 hover:bg-muted/60 shadow-xs">
              <span>Salary Breakdown</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </Link>
          <Link href={ROUTES.EMPLOYEE.PROFILE}>
            <Button size="sm" className="h-9 text-xs gap-1.5 bg-primary text-primary-foreground shadow-xs">
              <User className="w-3.5 h-3.5 mr-1" />
              <span>My Profile</span>
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
