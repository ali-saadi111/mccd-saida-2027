import { createSocialImage } from '@/lib/og';
import { getEventBySlug, venues } from '@/lib/data';
import { localised } from '@/lib/data/types';
import { dateLabel } from '@/lib/dates';
import en from '@/messages/en.json';
import ar from '@/messages/ar.json';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const event = await getEventBySlug(slug);
  const m = locale === 'ar' ? ar : en;
  return createSocialImage({
    locale,
    title: event ? localised(event, 'title', locale) : m.site.name,
    detail: event
      ? dateLabel(event.starts_at, locale) +
        ' · ' +
        localised(
          venues.find((v) => v.id === event.venue_id)!,
          'name',
          locale,
        )
      : m.site.sampleShort,
  });
}
