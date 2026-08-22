import {
  format,
  isToday as dateFnsIsToday,
  isWeekend as dateFnsIsWeekend,
  differenceInDays,
  startOfWeek,
  addDays,
  formatDistanceToNow,
} from 'date-fns';

export const formatDate = (
  date: Date | string | number,
  formatPattern: string = 'dd MMM yyyy'
): string => {
  if (!date) return '';
  return format(new Date(date), formatPattern);
};

export const formatTime = (date: Date | string | number): string => {
  if (!date) return '';
  return format(new Date(date), 'hh:mm a');
};

export const formatDateTime = (date: Date | string | number): string => {
  if (!date) return '';
  return format(new Date(date), 'dd MMM yyyy, hh:mm a');
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const getDayName = (date: Date | string | number): string => {
  if (!date) return '';
  return format(new Date(date), 'EEEE');
};

export const getWeekDates = (date: Date = new Date()): Date[] => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
};

export const calculateDaysBetween = (
  start: Date | string,
  end: Date | string
): number => {
  const s = new Date(start);
  const e = new Date(end);
  const diff = differenceInDays(e, s);
  return diff >= 0 ? diff + 1 : 0;
};

export const isToday = (date: Date | string | number): boolean => {
  if (!date) return false;
  return dateFnsIsToday(new Date(date));
};

export const isWeekend = (date: Date | string | number): boolean => {
  if (!date) return false;
  return dateFnsIsWeekend(new Date(date));
};

export const formatRelativeDate = (date: Date | string | number): string => {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return formatDate(date);
  }
};
