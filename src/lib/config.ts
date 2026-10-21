export type BookingMode = 'time-slots' | 'whole-day';
export const BOOKING_MODE: BookingMode =
  process.env.NEXT_PUBLIC_BOOKING_MODE === 'whole-day'
    ? 'whole-day'
    : 'time-slots';
export const TIME_ZONE = 'Asia/Beirut';
export const YEAR = 2027;
/** Home hero photograph, e.g. '/photos/hero.jpg' in public/. Null shows the illustration. */
export const HERO_IMAGE: string | null = '/photos/hero.jpg';
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? 'https://' + process.env.VERCEL_URL
    : 'http://localhost:3000');
