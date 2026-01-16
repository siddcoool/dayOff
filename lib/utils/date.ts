import { differenceInDays, eachDayOfInterval, isWeekend, format } from 'date-fns';

export function calculateBusinessDays(startDate: Date, endDate: Date): number {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  return days.filter(day => !isWeekend(day)).length;
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
}

export function formatMonth(month: string): string {
  const [year, monthNum] = month.split('-');
  const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
  return format(date, 'MMMM yyyy');
}

export function getCurrentMonth(): string {
  return format(new Date(), 'yyyy-MM');
}
