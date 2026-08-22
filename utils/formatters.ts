export { formatDate, formatTime, formatDateTime } from './date';
export { formatCurrency, formatAnnualCTC, parseCurrency } from './currency';

export function getInitials(name: string): string {
  if (!name) return 'DF';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength) + '...';
}

export function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatEmployeeId(num: number | string): string {
  if (typeof num === 'string' && num.startsWith('EMP-')) return num;
  return `EMP-${String(num).padStart(3, '0')}`;
}

export function getStatusColor(status: string): string {
  switch (status?.toLowerCase()) {
    case 'present':
    case 'approved':
    case 'active':
      return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
    case 'half_day':
    case 'pending':
    case 'on_leave':
      return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
    case 'absent':
    case 'rejected':
    case 'inactive':
      return 'text-destructive bg-destructive/10 border-destructive/20';
    case 'leave':
      return 'text-blue-600 bg-blue-500/10 border-blue-500/20';
    default:
      return 'text-muted-foreground bg-muted border-border';
  }
}
