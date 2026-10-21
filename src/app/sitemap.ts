import type { MetadataRoute } from 'next';
import { getEvents, getNews } from '@/lib/data';
import { SITE_URL } from '@/lib/config';
import { LOCALES } from '@/lib/metadata';
const STATIC_PATHS = [
  '',
  '/events',
  '/news',
  '/about',
  '/contact',
  '/submit',
  '/privacy',
  '/accessibility',
];
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, news] = await Promise.all([getEvents(), getNews()]);
  const entries: { path: string; lastModified?: string }[] = [
    ...STATIC_PATHS.map((path) => ({ path })),
    ...events
      .filter((e) => e.status === 'published')
      .map((e) => ({ path: '/events/' + e.slug })),
    ...news.map((n) => ({
      path: '/news/' + n.slug,
      lastModified: n.published_at ?? undefined,
    })),
  ];
  const languages = (path: string) =>
    Object.fromEntries(LOCALES.map((l) => [l, SITE_URL + '/' + l + path]));
  return entries.flatMap(({ path, lastModified }) =>
    LOCALES.map((locale) => ({
      url: SITE_URL + '/' + locale + path,
      lastModified,
      alternates: { languages: languages(path) },
    })),
  );
}
