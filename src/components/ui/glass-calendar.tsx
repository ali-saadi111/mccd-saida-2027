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
  isMarked: boolean;
}

type View = 'days' | 'month';

export interface GlassCalendarLabels {
  days: string;
  month: string;
  view: string;
  previousMonth: string;
  nextMonth: string;
  today: string;
  hasEvents: string;
}

const defaultLabels: GlassCalendarLabels = {
  days: 'Days',
  month: 'Month',
  view: 'Calendar view',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  today: 'Today',
  hasEvents: 'has events',
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
  /** Days that carry a marker dot, e.g. days with events. */
  markedDates?: Date[];
  minMonth?: Date;
  maxMonth?: Date;
  /** BCP 47 locale for month, weekday and digit formatting. */
  locale?: string;
  defaultView?: View;
  labels?: Partial<GlassCalendarLabels>;
  /** Content below the divider, e.g. a summary of the selected day. */
  footer?: React.ReactNode;
  className?: string;
}

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
      defaultView = 'days',
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
    const [view, setView] = React.useState<View>(defaultView);
    const currentMonth = propMonth || innerMonth;
    const selectedDate =
      propSelectedDate === undefined ? innerSelected : propSelectedDate;
    const strip = React.useRef<HTMLDivElement>(null);
    const headingId = React.useId();

    const fmt = React.useMemo(
      () => ({
        month: new Intl.DateTimeFormat(locale, { month: 'long' }),
        year: new Intl.DateTimeFormat(locale, { year: 'numeric' }),
        weekday: new Intl.DateTimeFormat(locale, { weekday: 'narrow' }),
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
          isMarked: markedDates.some((d) => isSameDay(d, date)),
        });
      }
      return days;
    }, [currentMonth, selectedDate, markedDates]);

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

    // Keep the selected (or first marked) day in view in the scrolling strip.
    // scrollBy is relative, so it behaves the same in LTR and RTL.
    React.useEffect(() => {
      if (view !== 'days' || !strip.current) return;
      const target =
        strip.current.querySelector<HTMLElement>('[aria-pressed="true"]') ||
        strip.current.querySelector<HTMLElement>('[data-marked]');
      if (!target) return;
      const box = strip.current.getBoundingClientRect();
      const item = target.getBoundingClientRect();
      strip.current.scrollBy({
        left: item.left + item.width / 2 - (box.left + box.width / 2),
        behavior: 'instant',
      });
    }, [view, currentMonth, selectedDate]);

    const dayButton = (day: Day, size: 'strip' | 'grid') => (
      <button
        type="button"
        onClick={() => handleDateClick(day.date)}
        aria-pressed={day.isSelected}
        data-marked={day.isMarked || undefined}
        aria-label={[
          fmt.full.format(day.date),
          day.isToday ? labels.today : '',
          day.isMarked ? labels.hasEvents : '',
        ]
          .filter(Boolean)
          .join(', ')}
        className={cn(
          'relative flex items-center justify-center rounded-full text-sm font-semibold tabular-nums transition-colors duration-200',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
          size === 'strip' ? 'h-11 w-11' : 'aspect-square w-full max-w-11',
          {
            'bg-paper text-ink shadow-lg': day.isSelected,
            'text-white hover:bg-white/15': !day.isSelected,
            'ring-1 ring-white/45 ring-inset': day.isToday && !day.isSelected,
          },
        )}
      >
        {fmt.day.format(getDate(day.date))}
        {day.isMarked && (
          <span
            aria-hidden
            className={cn(
              'absolute bottom-1.5 h-1 w-1 rounded-full',
              day.isSelected ? 'bg-rust' : 'bg-sand',
            )}
          />
        )}
      </button>
    );

    // Monday-first grid: blanks before the 1st of the month.
    const leading = getISODay(startOfMonth(currentMonth)) - 1;
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
        {/* Header: view toggle */}
        <div className="flex items-center justify-between gap-4">
          <div
            role="group"
            aria-label={labels.view}
            className="flex items-center gap-1 rounded-full bg-white/10 p-1"
          >
            {(['days', 'month'] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={cn(
                  'min-h-9 rounded-full px-4 text-xs font-semibold transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                  view === v
                    ? 'bg-paper text-ink'
                    : 'text-white/75 hover:text-white',
                )}
              >
                {labels[v]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
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

        {/* Month display */}
        <motion.h2
          id={headingId}
          key={currentMonth.getFullYear() * 12 + currentMonth.getMonth()}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          aria-live="polite"
          className="glass-calendar-title my-6 flex items-baseline gap-3 text-white"
        >
          <span>{fmt.month.format(currentMonth)}</span>{' '}
          <span className="font-sans text-sm font-medium tracking-wide text-white/60">
            {fmt.year.format(currentMonth)}
          </span>
        </motion.h2>

        {view === 'days' ? (
          /* Scrollable day strip */
          <div
            ref={strip}
            role="group"
            aria-labelledby={headingId}
            className="scrollbar-hide glass-strip -mx-6 overflow-x-auto px-6 py-1"
          >
            <div className="flex gap-2">
              {monthDays.map((day) => (
                <div
                  key={day.date.getDate()}
                  className="flex flex-shrink-0 flex-col items-center gap-2"
                >
                  <span
                    aria-hidden
                    className="text-[0.6875rem] font-semibold text-white/55"
                  >
                    {fmt.weekday.format(day.date)}
                  </span>
                  {dayButton(day, 'strip')}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Month grid */
          <div role="group" aria-labelledby={headingId}>
            <div
              aria-hidden
              className="mb-2 grid grid-cols-7 text-center text-[0.6875rem] font-semibold text-white/55"
            >
              {weekdayHeads.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 justify-items-center gap-y-1">
              {Array.from({ length: leading }, (_, i) => (
                <span key={'blank' + i} aria-hidden />
              ))}
              {monthDays.map((day) => (
                <React.Fragment key={day.date.getDate()}>
                  {dayButton(day, 'grid')}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {footer && (
          <>
            {/* Divider */}
            <div className="mt-6 h-px bg-white/20" />
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
