'use client';
import { useLocale, useTranslations } from 'next-intl';
import {
  GlassCalendar,
  keyToDate,
  dateToKey,
  type GlassCalendarProps,
} from './ui/glass-calendar';
import { intlLocale } from '@/lib/dates';
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
} & Pick<GlassCalendarProps, 'footer' | 'className' | 'defaultView'>) {
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
      markedDates={[...new Set(eventDates)].map(keyToDate)}
      minMonth={new Date(YEAR, 0, 1)}
      maxMonth={new Date(YEAR, 11, 1)}
      labels={{
        days: t('calendar.days'),
        month: t('calendar.month'),
        view: t('calendar.view'),
        previousMonth: t('common.previousMonth'),
        nextMonth: t('common.nextMonth'),
        today: t('calendar.today'),
        hasEvents: t('calendar.hasEvents'),
      }}
    />
  );
}
