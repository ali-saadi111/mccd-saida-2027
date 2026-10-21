import { createSocialImage } from '@/lib/og';
import { messagesFor } from '@/lib/metadata';
import { YEAR } from '@/lib/config';
import { numberLabel } from '@/lib/dates';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const m = messagesFor(locale);
  return createSocialImage({
    locale,
    title: m.home.subtitle,
    detail:
      m.home.saida +
      (locale === 'ar' ? '، ' : ', ') +
      m.home.lebanon +
      ' · ' +
      numberLabel(YEAR, locale, { useGrouping: false }),
  });
}
