export type Locale = 'en' | 'ar';
export type Category =
  'music' | 'heritage' | 'workshop' | 'dialogue' | 'exhibition';
export type Audience = 'everyone' | 'families' | 'young-people' | 'adults';
export type Slot = 'morning' | 'afternoon' | 'evening' | 'whole-day';
export type Event = {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  category: Category;
  audience: Audience[];
  venue_id: string;
  starts_at: string;
  ends_at: string;
  language: string[];
  entry: 'free' | 'ticketed';
  ticket_url: string | null;
  accessibility_en: string;
  accessibility_ar: string;
  image_url: string | null;
  organiser_name: string;
  organisation: string;
  status: 'published' | 'review' | 'cancelled';
};
export type Venue = {
  id: string;
  name_en: string;
  name_ar: string;
  lat: number;
  lng: number;
};
/** Private table: never spread a Reservation onto a public event or public API. */
export type Reservation = {
  id: string;
  event_id: string | null;
  venue_id: string;
  date: string;
  slot: Slot;
  status: 'confirmed' | 'cancelled';
  organiser_email: string;
  organiser_phone: string;
};
export type NewsPost = {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
  category: 'announcement' | 'programme' | 'community';
  published_at: string | null;
  status: 'draft' | 'scheduled' | 'published';
  image_url: string | null;
};
export type EventFilters = {
  search?: string;
  month?: string;
  date?: string;
  category?: string;
  audience?: string;
  freeOnly?: boolean;
};
export type DayAvailability = {
  date: string;
  state: 'available' | 'partial' | 'full';
  slots: { slot: Slot; available: boolean }[];
};
export const categories: Category[] = [
  'music',
  'heritage',
  'workshop',
  'dialogue',
  'exhibition',
];
export const audiences: Audience[] = [
  'everyone',
  'families',
  'young-people',
  'adults',
];
export const slots: Slot[] = ['morning', 'afternoon', 'evening'];
export function localised<T extends object>(
  item: T,
  field: string,
  locale: string,
): string {
  return String(item[(field + '_' + locale) as keyof T] ?? '');
}
