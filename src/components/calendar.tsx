'use client';
import {
  Calendar,
  CalendarGrid,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarGridBody,
  CalendarCell,
  Heading,
  Button as AriaButton,
  DatePicker,
  Group,
  DateInput,
  DateSegment,
  Popover,
  Dialog,
} from 'react-aria-components';
import { parseDate, type DateValue } from '@internationalized/date';
import { CaretLeft, CaretRight, CalendarBlank } from '@phosphor-icons/react';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import type { DayAvailability } from '@/lib/data/types';
import { numberLabel } from '@/lib/dates';
type Props = {
  value: string;
  onChange: (date: string) => void;
  month?: string;
  onMonthChange?: (month: string) => void;
  availability?: DayAvailability[];
  eventDates?: string[];
  label?: string;
  isDisabled?: boolean;
  booking?: boolean;
};
export function ProgrammeCalendar({
  value,
  onChange,
  month = '2027-03',
  onMonthChange,
  availability,
  eventDates,
  label,
  isDisabled,
  booking = false,
}: Props) {
  const t = useTranslations();
  const l = useLocale();
  const [focused, setFocused] = useState<DateValue>(parseDate(month + '-01'));
  useEffect(() => {
    setFocused(parseDate(month + '-01'));
  }, [month]);
  const dayInfo = (date: DateValue) =>
    availability?.find((d) => d.date === date.toString());
  return (
    <div>
      <Calendar
        aria-label={label || t('booking.chooseDay')}
        value={value ? parseDate(value) : null}
        focusedValue={focused}
        onFocusChange={(date) => {
          setFocused(date);
          onMonthChange?.(date.toString().slice(0, 7));
        }}
        onChange={(date) => onChange(date.toString())}
        minValue={parseDate('2027-01-01')}
        maxValue={parseDate('2027-12-31')}
        isDateUnavailable={(date) => booking && dayInfo(date)?.state === 'full'}
        isDisabled={isDisabled}
        className="calendar"
      >
        <header className="calendar-header">
          <AriaButton
            slot="previous"
            className="button button-ghost button-icon"
            aria-label={t('common.previousMonth')}
          >
            <CaretLeft weight="thin" />
          </AriaButton>
          <Heading />
          <AriaButton
            slot="next"
            className="button button-ghost button-icon"
            aria-label={t('common.nextMonth')}
          >
            <CaretRight weight="thin" />
          </AriaButton>
        </header>
        <CalendarGrid className="calendar-grid" weekdayStyle="short">
          <CalendarGridHeader>
            {(day) => <CalendarHeaderCell>{day}</CalendarHeaderCell>}
          </CalendarGridHeader>
          <CalendarGridBody>
            {(date) => {
              const info = dayInfo(date);
              const hasEvent = eventDates?.includes(date.toString());
              const state =
                value === date.toString()
                  ? 'selected'
                  : info?.state || 'available';
              return (
                <CalendarCell
                  date={date}
                  render={(props, cell) => (
                    <div
                      {...props}
                      aria-label={
                        availability
                          ? cell.formattedDate +
                            ' ' +
                            t('common.' + state) +
                            ', ' +
                            props['aria-label']
                          : props['aria-label']
                      }
                    />
                  )}
                  className="calendar-cell"
                  data-state={info?.state}
                >
                  {({ formattedDate, isSelected }) => (
                    <>
                      <span>
                        {formattedDate}
                        {availability ? ' ' : ''}
                      </span>
                      {availability ? (
                        <small>
                          {isSelected
                            ? t('common.selected')
                            : info
                              ? t('common.' + info.state)
                              : t('common.available')}
                        </small>
                      ) : hasEvent ? (
                        <small
                          aria-label={t('events.count', {
                            count: 1,
                            n: numberLabel(1, l),
                          })}
                        >
                          •
                        </small>
                      ) : null}
                    </>
                  )}
                </CalendarCell>
              );
            }}
          </CalendarGridBody>
        </CalendarGrid>
      </Calendar>
      {booking && (
        <div className="calendar-legend">
          {['available', 'partial', 'full', 'selected'].map((s) => (
            <span key={s}>
              <i className={s} />
              {t('common.' + s)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
export function DateFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useTranslations();
  return (
    <DatePicker
      aria-label={t('events.date')}
      value={value ? parseDate(value) : null}
      onChange={(v) => onChange(v?.toString() || '')}
      minValue={parseDate('2027-01-01')}
      maxValue={parseDate('2027-12-31')}
      className="field"
    >
      <span className="group-label">{t('events.date')}</span>
      <Group className="input flex items-center gap-2">
        <DateInput className="flex flex-1">
          {(segment) => (
            <DateSegment
              segment={segment}
              className="rounded px-0.5 data-[focused]:bg-mist"
            />
          )}
        </DateInput>
        <AriaButton
          className="button button-ghost button-icon"
          aria-label={t('events.date')}
        >
          <CalendarBlank weight="thin" />
        </AriaButton>
      </Group>
      <Popover className="popover p-4">
        <Dialog>
          <Calendar
            defaultFocusedValue={parseDate('2027-03-01')}
            className="calendar"
          >
            <header className="calendar-header">
              <AriaButton
                slot="previous"
                className="button button-icon button-ghost"
              >
                <CaretLeft weight="thin" />
              </AriaButton>
              <Heading />
              <AriaButton
                slot="next"
                className="button button-icon button-ghost"
              >
                <CaretRight weight="thin" />
              </AriaButton>
            </header>
            <CalendarGrid className="calendar-grid">
              {(date) => <CalendarCell date={date} className="calendar-cell" />}
            </CalendarGrid>
          </Calendar>
        </Dialog>
      </Popover>
    </DatePicker>
  );
}
