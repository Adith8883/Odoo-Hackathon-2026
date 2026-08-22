import React from 'react';
import { cn } from '../../utils/helpers';

export type StatusType =
  | 'PRESENT'
  | 'ABSENT'
  | 'HALF_DAY'
  | 'LEAVE'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ADMIN'
  | 'EMPLOYEE'
  | 'ACTIVE'
  | 'PAID'
  | 'SICK'
  | 'UNPAID';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  size = 'md',
}) => {
  const normalizedStatus = (status || '').toUpperCase();

  const getStyle = (st: string) => {
    switch (st) {
      case 'PRESENT':
      case 'APPROVED':
      case 'PAID':
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/10';
      case 'PENDING':
      case 'HALF_DAY':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/10';
      case 'ABSENT':
      case 'REJECTED':
      case 'UNPAID':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/10';
      case 'LEAVE':
      case 'SICK':
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/10';
      case 'ADMIN':
        return 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-600/10';
      case 'EMPLOYEE':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-600/10';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/10';
    }
  };

  const formatText = (st: string) => {
    switch (st) {
      case 'HALF_DAY':
        return 'Half Day';
      default:
        return st.charAt(0) + st.slice(1).toLowerCase();
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border ring-1',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        getStyle(normalizedStatus),
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {formatText(normalizedStatus)}
    </span>
  );
};
