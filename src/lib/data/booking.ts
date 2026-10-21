import { BOOKING_MODE, type BookingMode } from '@/lib/config';
import { dateKey, slotTimes } from '@/lib/dates';
import { mockEvents, eventSlots, venues, mockNews } from './mock';
import {
  slots,
  type Reservation,
  type DayAvailability,
  type Slot,
  type Event,
  type NewsPost,
} from './types';
import { submissionSchema, type Submission } from '@/lib/schemas/submission';
// Form-only fields have no columns in the supplied future table contract.
// Keep them in an explicit UI sidecar until the production schema is confirmed.
export type Store = {
  events: Event[];
  reservations: Reservation[];
  news_posts: NewsPost[];
  submission_details?: Record<
    string,
    {
      expected_attendance: number;
      attachment_name: string | null;
      submitted_locale: string;
    }
  >;
};
export const STORE_KEY = 'saida-2027-demo-v1';
export const DRAFT_KEY = 'saida-2027-draft-v1';
export function initialStore(): Store {
  return {
    events: structuredClone(mockEvents),
    news_posts: structuredClone(mockNews),
    reservations: [
      ...mockEvents.map((e, i) => ({
        id: 'r' + (i + 1),
        event_id: e.id,
        venue_id: e.venue_id,
        date: dateKey(e.starts_at),
        slot: eventSlots[e.id],
        status: 'confirmed' as const,
        organiser_email: 'sample' + (i + 1) + '@example.invalid',
        organiser_phone: '+961 00 000 000',
      })),
      ...slots.map((slot, i) => ({
        id: 'hold' + i,
        event_id: null,
        venue_id: 'sea',
        date: '2027-03-15',
        slot,
        status: 'confirmed' as const,
        organiser_email: '',
        organiser_phone: '',
      })),
    ],
  };
}
export function readStore(): Store {
  if (typeof window === 'undefined') return initialStore();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const value = JSON.parse(raw);
      if (
        Array.isArray(value.events) &&
        Array.isArray(value.reservations) &&
        Array.isArray(value.news_posts)
      )
        return value;
    }
  } catch {
    /* Recover gracefully from a blocked or corrupted browser store. */
  }
  return initialStore();
}
export function writeStore(value: Store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(value));
  window.dispatchEvent(new Event('saida-data'));
}
export function isSlotFree(
  reservations: Reservation[],
  venue: string,
  date: string,
  slot: Slot,
  mode: BookingMode = BOOKING_MODE,
  exceptId?: string,
) {
  return !reservations.some(
    (r) =>
      r.id !== exceptId &&
      r.status === 'confirmed' &&
      r.venue_id === venue &&
      r.date === date &&
      (mode === 'whole-day' ||
        r.slot === 'whole-day' ||
        slot === 'whole-day' ||
        r.slot === slot),
  );
}
export function availabilityFor(
  reservations: Reservation[],
  venue: string,
  month: string,
  mode: BookingMode = BOOKING_MODE,
): DayAvailability[] {
  const [year, m] = month.split('-').map(Number);
  const length = new Date(Date.UTC(year, m, 0)).getUTCDate();
  return Array.from({ length }, (_, index) => {
    const date = month + '-' + String(index + 1).padStart(2, '0');
    const daySlots = (
      mode === 'whole-day' ? (['whole-day'] as Slot[]) : slots
    ).map((slot) => ({
      slot,
      available: isSlotFree(reservations, venue, date, slot, mode),
    }));
    const free = daySlots.filter((s) => s.available).length;
    return {
      date,
      state:
        free === 0
          ? 'full'
          : free === daySlots.length
            ? 'available'
            : 'partial',
      slots: daySlots,
    };
  });
}
/** Public availability is projected without any private reservation contact fields. */
export async function getAvailability(
  venueId: string,
  month: string,
  mode: BookingMode = BOOKING_MODE,
) {
  return availabilityFor(readStore().reservations, venueId, month, mode);
}
export function nearbySlots(
  reservations: Reservation[],
  venue: string,
  date: string,
  mode: BookingMode = BOOKING_MODE,
) {
  const options: { date: string; slot: Slot }[] = [];
  for (let i = 0; i < 14 && options.length < 3; i++) {
    const d = new Date(date + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + i);
    const day = d.toISOString().slice(0, 10);
    if (!day.startsWith('2027-')) break;
    for (const slot of mode === 'whole-day'
      ? (['whole-day'] as Slot[])
      : slots) {
      if (isSlotFree(reservations, venue, day, slot, mode))
        options.push({ date: day, slot });
      if (options.length === 3) break;
    }
  }
  return options;
}
export type BookingResult =
  | { ok: true; reservation: Reservation; event: Event }
  | { ok: false; alternatives: { date: string; slot: Slot }[] };
export async function createReservation(
  input: Submission,
  locale: string,
  simulateConflict = false,
  attachmentName: string | null = null,
): Promise<BookingResult> {
  const data = submissionSchema.parse(input);
  const perform = async (): Promise<BookingResult> => {
    const store = readStore();
    const slot: Slot = BOOKING_MODE === 'whole-day' ? 'whole-day' : data.slot;
    if (!venues.some((v) => v.id === data.venue_id)) throw new Error('venue');
    if (
      simulateConflict &&
      isSlotFree(store.reservations, data.venue_id, data.date, slot)
    ) {
      store.reservations.push({
        id: crypto.randomUUID(),
        event_id: null,
        venue_id: data.venue_id,
        date: data.date,
        slot,
        status: 'confirmed',
        organiser_email: '',
        organiser_phone: '',
      });
      writeStore(store);
    }
    if (!isSlotFree(store.reservations, data.venue_id, data.date, slot))
      return {
        ok: false,
        alternatives: nearbySlots(store.reservations, data.venue_id, data.date),
      };
    const id = crypto.randomUUID();
    const event: Event = {
      id,
      slug: 'community-' + id,
      title_en: data.title,
      title_ar: data.title,
      description_en: data.description,
      description_ar: data.description,
      category: data.category,
      audience: data.audience,
      venue_id: data.venue_id,
      ...slotTimes(data.date, slot),
      language: data.language,
      entry: data.entry,
      ticket_url: data.website || null,
      accessibility_en: data.accessibility,
      accessibility_ar: data.accessibility,
      image_url: null,
      organiser_name: data.name,
      organisation: data.organisation,
      // Held for the programme team; published only after approval in admin.
      status: 'review',
    };
    const reservation: Reservation = {
      id: crypto.randomUUID(),
      event_id: id,
      venue_id: data.venue_id,
      date: data.date,
      slot,
      status: 'confirmed',
      organiser_email: data.email,
      organiser_phone: data.phone,
    };
    store.events.push(event);
    store.reservations.push(reservation);
    store.submission_details = {
      ...store.submission_details,
      [id]: {
        expected_attendance: data.attendance,
        attachment_name: attachmentName,
        submitted_locale: locale,
      },
    };
    writeStore(store);
    return { ok: true, event, reservation };
  };
  // Serialises competing tabs on supporting browsers. A production server must enforce
  // uniqueness transactionally; browser locks are a demonstration, not a backend guarantee.
  if (typeof navigator !== 'undefined' && navigator.locks)
    return navigator.locks.request('saida-reservations', perform);
  return perform();
}
