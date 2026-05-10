import {
  endOfDay,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
} from 'date-fns';

export function getCurrentIsoTime(reference = new Date()): string {
  return reference.toISOString();
}

export function parseIsoTime(isoTime: string): Date {
  return parseISO(isoTime);
}

export function formatLedgerTime(isoTime: string): string {
  return format(parseIsoTime(isoTime), 'yyyy-MM-dd HH:mm');
}

export function formatIsoTimeForDateTimeLocal(isoTime: string): string {
  return format(parseIsoTime(isoTime), "yyyy-MM-dd'T'HH:mm");
}

export function getCurrentDateTimeLocalValue(reference = new Date()): string {
  return format(reference, "yyyy-MM-dd'T'HH:mm");
}

export function parseDateTimeLocalToIso(localTime: string): string | null {
  if (!localTime.trim()) {
    return null;
  }

  return parseISO(localTime).toISOString();
}

export function getStartOfToday(reference = new Date()): Date {
  return startOfDay(reference);
}

export function getStartOfMonth(reference = new Date()): Date {
  return startOfMonth(reference);
}

export function isSameLocalCalendarDay(left: string | Date, right: string | Date): boolean {
  return isSameDay(toDate(left), toDate(right));
}

export function isSameLocalCalendarMonth(left: string | Date, right: string | Date): boolean {
  return isSameMonth(toDate(left), toDate(right));
}

export function isWithinTodayBoundary(value: string | Date, reference = new Date()): boolean {
  const target = toDate(value);
  return !isBefore(target, startOfDay(reference)) && !isAfter(target, endOfDay(reference));
}

export function isWithinMonthBoundary(value: string | Date, reference = new Date()): boolean {
  const target = toDate(value);
  return !isBefore(target, startOfMonth(reference)) && !isAfter(target, endOfMonth(reference));
}

function toDate(value: string | Date): Date {
  return typeof value === 'string' ? parseIsoTime(value) : value;
}
