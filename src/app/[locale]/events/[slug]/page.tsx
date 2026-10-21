import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEventBySlug, venues } from '@/lib/data';
import { localised } from '@/lib/data/types';
import { EventDetail } from '@/components/event-detail';
import { dateLabel } from '@/lib/dates';
import { localeAlternates, ogLocale } from '@/lib/metadata';
import { JsonLd, eventJsonLd } from '@/lib/structured-data';
type Props = { params: Promise<{ locale: string; slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return {};
  const title = localised(event, 'title', locale);
  const venue = venues.find((v) => v.id === event.venue_id)!;
  const description =
    dateLabel(event.starts_at, locale) +
    ' · ' +
    localised(venue, 'name', locale) +
    ' — ' +
    localised(event, 'description', locale);
  const image = '/' + locale + '/events/' + slug + '/opengraph-image';
  return {
    title,
    description,
    alternates: localeAlternates(locale, '/events/' + slug),
    openGraph: {
      title,
      description,
      locale: ogLocale(locale),
      type: 'article',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}
export default async function Page({ params }: Props) {
  const { locale, slug } = await params;
  const initial = await getEventBySlug(slug);
  if (!initial && !/^community-[a-f0-9-]+$/.test(slug)) notFound();
  const venue = initial && venues.find((v) => v.id === initial.venue_id);
  return (
    <>
      {initial && venue && (
        <JsonLd data={eventJsonLd(initial, venue, locale)} />
      )}
      <EventDetail slug={slug} initial={initial} />
    </>
  );
}
