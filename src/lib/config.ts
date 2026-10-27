export type BookingMode = 'time-slots' | 'whole-day';
export const BOOKING_MODE: BookingMode =
  process.env.NEXT_PUBLIC_BOOKING_MODE === 'whole-day'
    ? 'whole-day'
    : 'time-slots';
export const TIME_ZONE = 'Asia/Beirut';
export const YEAR = 2027;
/** Public contact address, shown on the contact page and in the footer. */
export const CONTACT_EMAIL = 'municipality@saida.gov.lb';
/** Home hero photograph, e.g. '/photos/hero.jpg' in public/. Null shows the illustration. */
export const HERO_IMAGE: string | null = '/photos/hero.jpg';
/** Lighter WebP cuts of HERO_IMAGE: a portrait crop for phones, the full frame elsewhere. Clear when replacing the photograph. */
export const HERO_SOURCES = HERO_IMAGE
  ? [
      {
        media: '(max-width: 767px)',
        srcSet: '/photos/hero-tall.webp',
        type: 'image/webp',
      },
      { srcSet: '/photos/hero-wide.webp', type: 'image/webp' },
    ]
  : undefined;
/** Silent looping hero video over HERO_IMAGE; its poster is the first frame. Null keeps the still photograph. */
export const HERO_VIDEO: { src: string; poster: string } | null = {
  src: '/photos/hero-drone.mp4',
  poster: '/photos/hero-drone-poster.jpg',
};
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? 'https://' + process.env.VERCEL_URL
    : 'http://localhost:3000');
