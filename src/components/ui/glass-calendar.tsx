'use client';
import * as React from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import {
  addMonths,
  subMonths,
  isSameDay,
  isToday,
  getDate,
  getDaysInMonth,
  startOfMonth,
  getISODay,
  isBefore,
  isAfter,
} from 'date-fns';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

// --- TYPE DEFINITIONS ---
interface Day {
  date: Date;
  isToday: boolean;
  isSelected: boolean;
  /** Number of events on this day; 0 for a quiet day. */
  count: number;
}

export interface GlassCalendarLabels {
  previousMonth: string;
  nextMonth: string;
  today: string;
  legendEvents: string;
  legendSelected: string;
  /** Count of events, e.g. "2 events"; used in labels and the month total. */
  eventCount: (count: number) => string;
}

const defaultLabels: GlassCalendarLabels = {
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  today: 'Today',
  legendEvents: 'Days with events',
  legendSelected: 'Selected day',
  eventCount: (n) => (n === 1 ? '1 event' : n + ' events'),
};

export interface GlassCalendarProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange'
> {
  /** Selected day; `null` shows no selection. Uncontrolled when omitted. */
  selectedDate?: Date | null;
  onDateSelect?: (date: Date) => void;
  /** Visible month (any date inside it). Uncontrolled when omitted. */
  month?: Date;
  onMonthChange?: (month: Date) => void;
  /**
   * One entry per event, e.g. each event's start day. Repeated days are
   * counted and shown as a badge on that day.
   */
  markedDates?: Date[];
  minMonth?: Date;
  maxMonth?: Date;
  /** BCP 47 locale for month, weekday and digit formatting. */
  locale?: string;
  labels?: Partial<GlassCalendarLabels>;
  /** Content below the divider, e.g. a summary of the selected day. */
  footer?: React.ReactNode;
  className?: string;
}

const dayKey = (d: Date) =>
  d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate();

// --- MAIN COMPONENT ---
export const GlassCalendar = React.forwardRef<
  HTMLDivElement,
  GlassCalendarProps
>(
  (
    {
      className,
      selectedDate: propSelectedDate,
      onDateSelect,
      month: propMonth,
      onMonthChange,
      markedDates = [],
      minMonth,
      maxMonth,
      locale = 'en-GB',
      labels: propLabels,
      footer,
      ...props
    },
    ref,
  ) => {
    const labels = { ...defaultLabels, ...propLabels };
    const [innerMonth, setInnerMonth] = React.useState(
      () => propMonth || propSelectedDate || new Date(),
    );
    const [innerSelected, setInnerSelected] = React.useState<Date | null>(() =>
      propSelectedDate === undefined ? new Date() : propSelectedDate,
    );
    const currentMonth = propMonth || innerMonth;
    const selectedDate =
      propSelectedDate === undefined ? innerSelected : propSelectedDate;
    const headingId = React.useId();

    const fmt = React.useMemo(
      () => ({
        month: new Intl.DateTimeFormat(locale, { month: 'long' }),
        year: new Intl.DateTimeFormat(locale, { year: 'numeric' }),
        weekdayShort: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
        full: new Intl.DateTimeFormat(locale, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        day: new Intl.NumberFormat(locale),
      }),
      [locale],
    );

    // Events per day
    const counts = React.useMemo(() => {
      const map = new Map<number, number>();
      for (const d of markedDates)
        map.set(dayKey(d), (map.get(dayKey(d)) || 0) + 1);
      return map;
    }, [markedDates]);

    // Generate all days for the current month
    const monthDays = React.useMemo(() => {
      const start = startOfMonth(currentMonth);
      const totalDays = getDaysInMonth(currentMonth);
      const days: Day[] = [];
      for (let i = 0; i < totalDays; i++) {
        const date = new Date(start.getFullYear(), start.getMonth(), i + 1);
        days.push({
          date,
          isToday: isToday(date),
          isSelected: !!selectedDate && isSameDay(date, selectedDate),
          count: counts.get(dayKey(date)) || 0,
        });
      }
      return days;
    }, [currentMonth, selectedDate, counts]);
    const monthTotal = monthDays.reduce((sum, d) => sum + d.count, 0);

    const canGoBack =
      !minMonth || isAfter(startOfMonth(currentMonth), startOfMonth(minMonth));
    const canGoForward =
      !maxMonth || isBefore(startOfMonth(currentMonth), startOfMonth(maxMonth));

    const changeMonth = (next: Date) => {
      setInnerMonth(next);
      onMonthChange?.(next);
    };

    const handleDateClick = (date: Date) => {
      setInnerSelected(date);
      onDateSelect?.(date);
    };

    const handlePrevMonth = () => {
      if (canGoBack) changeMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
      if (canGoForward) changeMonth(addMonths(currentMonth, 1));
    };

    const dayButton = (day: Day) => (
      <button
        type="button"
        onClick={() => handleDateClick(day.date)}
        aria-pressed={day.isSelected}
        data-marked={day.count > 0 || undefined}
        aria-label={[
          fmt.full.format(day.date),
          day.isToday ? labels.today : '',
          day.count ? labels.eventCount(day.count) : '',
        ]
          .filter(Boolean)
          .join(', ')}
        className={cn(
          'relative flex aspect-square w-full max-w-12 items-center justify-center rounded-xl text-sm tabular-nums transition-colors duration-200',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
          {
            'bg-paper font-bold text-ink shadow-lg': day.isSelected,
            'bg-sand/35 font-bold text-white ring-2 ring-sand ring-inset hover:bg-sand/50':
              !day.isSelected && day.count > 0,
            'font-medium text-white/55 hover:bg-white/10 hover:text-white':
              !day.isSelected && !day.count,
            'underline decoration-2 underline-offset-4': day.isToday,
          },
        )}
      >
        {fmt.day.format(getDate(day.date))}
        {day.count > 0 && (
          <span
            aria-hidden
            className={cn(
              'absolute -end-1 -top-1 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full px-1 text-[0.625rem] leading-none font-bold',
              day.isSelected ? 'bg-rust text-paper' : 'bg-sand text-ink',
            )}
          >
            {fmt.day.format(day.count)}
          </span>
        )}
      </button>
    );

    // Monday-first grid: blanks before the 1st, then after the last day so
    // every month fills six weeks and the calendar keeps one height.
    const leading = getISODay(startOfMonth(currentMonth)) - 1;
    const trailing = 42 - leading - monthDays.length;
    const weekdayHeads = Array.from({ length: 7 }, (_, i) =>
      fmt.weekdayShort.format(new Date(2027, 1, 1 + i)),
    );

    return (
      <div
        ref={ref}
        className={cn(
          'w-full max-w-[380px] rounded-2xl p-6 shadow-[0_30px_80px_-24px_rgb(0_0_0/0.55)]',
          'border border-white/15 bg-[rgb(10_28_32/0.45)] backdrop-blur-xl',
          'text-white',
          className,
        )}
        {...props}
      >
        {/* Header: month title and navigation */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <motion.h2
            id={headingId}
            key={currentMonth.getFullYear() * 12 + currentMonth.getMonth()}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            aria-live="polite"
            className="glass-calendar-title flex flex-col gap-2 text-white"
          >
            <span>{fmt.month.format(currentMonth)}</span>{' '}
            <span className="font-sans text-sm font-medium tracking-wide text-white/60">
              {fmt.year.format(currentMonth)}
              {monthTotal > 0 && ' · ' + labels.eventCount(monthTotal)}
            </span>
          </motion.h2>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              disabled={!canGoBack}
              aria-label={labels.previousMonth}
              className="flex h-11 w-11 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white disabled:opacity-35 disabled:hover:bg-transparent"
            >
              <CaretLeft weight="light" className="h-5 w-5 rtl:-scale-x-100" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={!canGoForward}
              aria-label={labels.nextMonth}
              className="flex h-11 w-11 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white disabled:opacity-35 disabled:hover:bg-transparent"
            >
              <CaretRight weight="light" className="h-5 w-5 rtl:-scale-x-100" />
            </button>
          </div>
        </div>

        {/* Month grid */}
        <div role="group" aria-labelledby={headingId}>
          <div
            aria-hidden
            className="mb-2 grid grid-cols-7 text-center text-[0.6875rem] font-semibold text-white/55"
          >
            {weekdayHeads.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 justify-items-center gap-1.5">
            {Array.from({ length: leading }, (_, i) => (
              <span key={'blank' + i} aria-hidden />
            ))}
            {monthDays.map((day) => (
              <React.Fragment key={day.date.getDate()}>
                {dayButton(day)}
              </React.Fragment>
            ))}
            {Array.from({ length: trailing }, (_, i) => (
              <span
                key={'pad' + i}
                aria-hidden
                className="aspect-square w-full max-w-12"
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <ul
          aria-hidden
          className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/75"
        >
          <li className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded bg-sand/35 ring-2 ring-sand ring-inset" />
            {labels.legendEvents}
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded bg-paper" />
            {labels.legendSelected}
          </li>
        </ul>

        {footer && (
          <>
            {/* Divider */}
            <div className="mt-5 h-px bg-white/20" />
            {/* Footer */}
            <div className="mt-4">{footer}</div>
          </>
        )}
      </div>
    );
  },
);

GlassCalendar.displayName = 'GlassCalendar';

/** 'YYYY-MM-DD' / 'YYYY-MM' keys used across the site, as local dates. */
export const keyToDate = (key: string) => {
  const [y, m, d = 1] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const dateToKey = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
