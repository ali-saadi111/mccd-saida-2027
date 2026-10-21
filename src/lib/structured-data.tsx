import { SITE_URL } from '@/lib/config';
import { messagesFor } from '@/lib/metadata';
import {
  localised,
  type Event,
  type NewsPost,
  type Venue,
} from '@/lib/data/types';
const absolute = (path: string) =>
  /^https?:\/\//i.test(path) ? path : SITE_URL + path;
/** schema.org data for search engines; `<` is escaped so content cannot close the script. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
export function eventJsonLd(event: Event, venue: Venue, locale: string) {
  const path = '/' + locale + '/events/' + event.slug;
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: localised(event, 'title', locale),
    description: localised(event, 'description', locale),
    startDate: event.starts_at,
    endDate: event.ends_at,
    url: absolute(path),
    image: absolute(event.image_url || path + '/opengraph-image'),
    inLanguage: event.language,
    eventStatus:
      event.status === 'cancelled'
        ? 'https://schema.org/EventCancelled'
        : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    isAccessibleForFree: event.entry === 'free',
    location: {
      '@type': 'Place',
      name: localised(venue, 'name', locale),
      geo: {
        '@type': 'GeoCoordinates',
        latitude: venue.lat,
        longitude: venue.lng,
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: messagesFor(locale).home.saida,
        addressCountry: 'LB',
      },
    },
    organizer: { '@type': 'Organization', name: event.organisation },
    ...(event.ticket_url &&
      /^https?:\/\//i.test(event.ticket_url) && {
        offers: { '@type': 'Offer', url: event.ticket_url },
      }),
  };
}
export function newsJsonLd(post: NewsPost, locale: string) {
  const m = messagesFor(locale);
  const path = '/' + locale + '/news/' + post.slug;
  const publisher = {
    '@type': 'Organization',
    name: m.site.name,
    logo: absolute('/brand/icon-512.png'),
  };
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: localised(post, 'title', locale),
    description: localised(post, 'body', locale).slice(0, 160),
    url: absolute(path),
    mainEntityOfPage: absolute(path),
    image: absolute(post.image_url || path + '/opengraph-image'),
    inLanguage: locale,
    ...(post.published_at && { datePublished: post.published_at }),
    author: publisher,
    publisher,
  };
}
