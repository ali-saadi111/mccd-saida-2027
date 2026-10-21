import { mockEvents, mockNews, venues } from './mock';
import type { Event, EventFilters, NewsPost } from './types';
import { dateKey } from '@/lib/dates';
export { venues };
export function filterEvents(events: Event[], filters: EventFilters = {}) {
  return events
    .filter(
      (e) =>
        e.status === 'published' &&
        (!filters.search ||
          [
            e.title_en,
            e.title_ar,
            e.description_en,
            e.description_ar,
            ...Object.values(venues.find((v) => v.id === e.venue_id) || {}),
          ]
            .join(' ')
            .toLowerCase()
            .includes(filters.search.toLowerCase())) &&
        (!filters.month || dateKey(e.starts_at).startsWith(filters.month)) &&
        (!filters.date || dateKey(e.starts_at) === filters.date) &&
        (!filters.category || e.category === filters.category) &&
        (!filters.audience || e.audience.includes(filters.audience as never)) &&
        (!filters.freeOnly || e.entry === 'free'),
    )
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}
export async function getEvents(filters: EventFilters = {}) {
  return filterEvents(mockEvents, filters);
}
export async function getUpcomingEvents(limit = 3) {
  return (await getEvents())
    .filter((e) => e.starts_at >= new Date().toISOString())
    .slice(0, limit);
}
export async function getEventBySlug(slug: string) {
  return (
    mockEvents.find((e) => e.slug === slug && e.status === 'published') ?? null
  );
}
export function publishedNews(posts: NewsPost[]) {
  return posts
    .filter((n) => n.status === 'published')
    .sort((a, b) => (b.published_at || '').localeCompare(a.published_at || ''));
}
export async function getNews() {
  return publishedNews(mockNews);
}
export async function getNewsBySlug(slug: string) {
  return (await getNews()).find((n) => n.slug === slug) ?? null;
}
