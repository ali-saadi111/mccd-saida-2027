import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getNewsBySlug } from '@/lib/data';
import { localised } from '@/lib/data/types';
import { NewsArticle } from '@/components/news';
import { localeAlternates, ogLocale } from '@/lib/metadata';
import { JsonLd, newsJsonLd } from '@/lib/structured-data';
type Props = { params: Promise<{ locale: string; slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getNewsBySlug(slug);
  if (!post) return {};
  const title = localised(post, 'title', locale);
  const description = localised(post, 'body', locale).slice(0, 160);
  const image = '/' + locale + '/news/' + slug + '/opengraph-image';
  return {
    title,
    description,
    alternates: localeAlternates(locale, '/news/' + slug),
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
  const initial = await getNewsBySlug(slug);
  if (!initial && !/^post-[a-f0-9-]+$/.test(slug)) notFound();
  return (
    <>
      {initial && <JsonLd data={newsJsonLd(initial, locale)} />}
      <NewsArticle slug={slug} initial={initial} />
    </>
  );
}
