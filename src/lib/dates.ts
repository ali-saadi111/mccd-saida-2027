import { CalendarDateTime, toZoned } from '@internationalized/date';
import { TIME_ZONE } from './config';
import type { Slot } from './data/types';
export const slotHours: Record<Slot, [number, number]> = {
  morning: [9, 12],
  afternoon: [14, 17],
  evening: [18, 21],
  'whole-day': [9, 21],
};
export function slotTimes(date: string, slot: Slot) {
  const [y, m, d] = date.split('-').map(Number);
  const [start, end] = slotHours[slot];
  return {
    starts_at: toZoned(
      new CalendarDateTime(y, m, d, start),
      TIME_ZONE,
    ).toAbsoluteString(),
    ends_at: toZoned(
      new CalendarDateTime(y, m, d, end),
      TIME_ZONE,
    ).toAbsoluteString(),
  };
}
export function dateKey(value: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}
/** Lebanese Arabic gives Arabic-Indic digits; plain 'ar' would give Western digits. */
export const intlLocale = (locale: string) =>
  locale === 'ar' ? 'ar-LB-u-ca-gregory' : 'en-GB';
export function numberLabel(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions,
) {
  return new Intl.NumberFormat(intlLocale(locale), options).format(value);
}
export function dateLabel(
  value: string,
  locale: string,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  },
) {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: TIME_ZONE,
    ...options,
  }).format(new Date(value.length === 10 ? value + 'T12:00:00Z' : value));
}
export function timeLabel(value: string, locale: string) {
  return dateLabel(value, locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
