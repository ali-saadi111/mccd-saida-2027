'use client';
import { useLocale, useTranslations } from 'next-intl';
import {
  GlassCalendar,
  keyToDate,
  dateToKey,
  type GlassCalendarProps,
} from './ui/glass-calendar';
import { intlLocale, numberLabel } from '@/lib/dates';
import { YEAR } from '@/lib/config';
/**
 * The glass calendar wired to the site: translated labels, Arabic digits and
 * month names, the 2027 programme bounds and 'YYYY-MM-DD' / 'YYYY-MM' keys.
 */
export function DayCalendar({
  value,
  onChange,
  month,
  onMonthChange,
  eventDates,
  ...props
}: {
  value: string;
  onChange: (date: string) => void;
  month: string;
  onMonthChange: (month: string) => void;
  eventDates: string[];
} & Pick<GlassCalendarProps, 'footer' | 'className'>) {
  const t = useTranslations();
  const l = useLocale();
  return (
    <GlassCalendar
      {...props}
      locale={intlLocale(l)}
      selectedDate={value ? keyToDate(value) : null}
      onDateSelect={(d) => onChange(dateToKey(d))}
      month={keyToDate(month)}
      onMonthChange={(m) => onMonthChange(dateToKey(m).slice(0, 7))}
      markedDates={eventDates.map(keyToDate)}
      minMonth={new Date(YEAR, 0, 1)}
      maxMonth={new Date(YEAR, 11, 1)}
      labels={{
        previousMonth: t('common.previousMonth'),
        nextMonth: t('common.nextMonth'),
        today: t('calendar.today'),
        legendEvents: t('calendar.legendEvents'),
        legendSelected: t('calendar.legendSelected'),
        eventCount: (count) =>
          t('events.count', { count, n: numberLabel(count, l) }),
      }}
    />
  );
}
