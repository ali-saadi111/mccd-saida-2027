import { test, expect } from '@playwright/test';
import {
  availabilityFor,
  initialStore,
  isSlotFree,
  nearbySlots,
} from '../src/lib/data/booking';
import { mockEvents, venues } from '../src/lib/data/mock';
import { filterEvents } from '../src/lib/data';
import { dateLabel, slotTimes } from '../src/lib/dates';
import {
  submissionSchema,
  defaultSubmission,
} from '../src/lib/schemas/submission';
import { createICS, toCSV } from '../src/lib/download';
import en from '../src/messages/en.json';
import ar from '../src/messages/ar.json';
test('availability blocks occupied slots, preserves free slots and handles whole-day reservations', () => {
  const records = initialStore().reservations;
  const slots = availabilityFor(records, 'sea', '2027-03', 'time-slots');
  expect(slots.find((d) => d.date === '2027-03-06')?.state).toBe('partial');
  expect(slots.find((d) => d.date === '2027-03-15')?.state).toBe('full');
  expect(
    isSlotFree(records, 'sea', '2027-03-06', 'evening', 'time-slots'),
  ).toBe(false);
  expect(
    isSlotFree(records, 'sea', '2027-03-06', 'morning', 'time-slots'),
  ).toBe(true);
  expect(isSlotFree(records, 'sea', '2027-03-06', 'morning', 'whole-day')).toBe(
    false,
  );
  expect(
    isSlotFree(records, 'khan', '2027-03-06', 'evening', 'whole-day'),
  ).toBe(true);
  expect(
    availabilityFor(records, 'sea', '2027-03', 'whole-day').find(
      (d) => d.date === '2027-03-06',
    )?.state,
  ).toBe('full');
  expect(
    nearbySlots(records, 'sea', '2027-03-15', 'whole-day').every(
      (o) => o.date > '2027-03-15',
    ),
  ).toBe(true);
  const cancelled = records.map((r) =>
    r.id === 'r1' ? { ...r, status: 'cancelled' as const } : r,
  );
  expect(isSlotFree(cancelled, 'sea', '2027-03-06', 'evening')).toBe(true);
});
test('dates use Beirut timezone, correct weekdays and daylight-saving offsets', () => {
  expect(dateLabel(mockEvents[0].starts_at, 'en', { weekday: 'long' })).toBe(
    'Saturday',
  );
  expect(slotTimes('2027-03-20', 'morning').starts_at).toBe(
    '2027-03-20T07:00:00.000Z',
  );
  expect(slotTimes('2027-04-03', 'morning').starts_at).toBe(
    '2027-04-03T06:00:00.000Z',
  );
});
test('filters compose and unpublished events remain hidden', () => {
  const result = filterEvents(mockEvents, {
    month: '2027-03',
    category: 'workshop',
    freeOnly: true,
    audience: 'young-people',
  });
  expect(result.map((e) => e.id)).toEqual(['e3']);
  expect(filterEvents(mockEvents, { search: 'خان' }).length).toBeGreaterThan(0);
  expect(filterEvents([{ ...mockEvents[0], status: 'review' }])).toHaveLength(
    0,
  );
  expect(filterEvents(mockEvents, { date: '2027-03-15' })).toHaveLength(0);
});
test('validation rejects malformed date, unsafe URL, invalid contact and missing consent', () => {
  const valid = {
    ...defaultSubmission,
    title: 'A sample event',
    description: 'A sufficiently long sample event description.',
    date: '2027-03-07',
    name: 'Test Organiser',
    organisation: 'Test Culture',
    email: 'test@example.invalid',
    phone: '+961 71 123456',
    consent: true,
  };
  expect(submissionSchema.safeParse(valid).success).toBe(true);
  for (const patch of [
    { date: '2027-02-30' },
    { website: 'javascript:alert(1)' },
    { phone: '123' },
    { consent: false },
    { email: 'bad' },
  ]) {
    expect(submissionSchema.safeParse({ ...valid, ...patch }).success).toBe(
      false,
    );
  }
});
test('calendar export contains correct UTC dates and UTF-8 folded lines; CSV prevents formula execution', () => {
  const ics = createICS(mockEvents[0], venues[0], 'ar');
  expect(ics).toContain('BEGIN:VEVENT');
  expect(ics).toContain('DTSTART:20270306T160000Z');
  expect(ics).not.toMatch(/organiser_email|organiser_phone|example.invalid/);
  for (const line of ics.split('\r\n'))
    expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  expect(toCSV([{ title: '=HYPERLINK("bad")', phone: '+123' }])).toContain(
    '"\'=HYPERLINK',
  );
  expect(
    toCSV([{ id: 'fixture' }, { id: 'submission', expected_attendance: 42 }]),
  ).toContain('"expected_attendance"');
});
test('translations have exactly matching key structure and public rows exclude private fields', () => {
  const keys = (o: object, p = ''): string[] =>
    Object.entries(o).flatMap(([k, v]) =>
      typeof v === 'object' ? keys(v, p + k + '.') : [p + k],
    );
  expect(keys(ar).sort()).toEqual(keys(en).sort());
  for (const event of mockEvents) {
    expect(event).not.toHaveProperty('organiser_email');
    expect(event).not.toHaveProperty('organiser_phone');
  }
});
