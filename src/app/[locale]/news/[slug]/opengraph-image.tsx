import { createSocialImage } from '@/lib/og';
import { getNewsBySlug } from '@/lib/data';
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
  const post = await getNewsBySlug(slug);
  const m = locale === 'ar' ? ar : en;
  return createSocialImage({
    locale,
    title: post ? localised(post, 'title', locale) : m.site.name,
    detail: post?.published_at
      ? dateLabel(post.published_at, locale) + ' · ' + m.home.saida
      : m.site.sampleShort,
  });
}
