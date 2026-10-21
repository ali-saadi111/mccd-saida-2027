import type { Metadata } from 'next';
import en from '@/messages/en.json';
import ar from '@/messages/ar.json';
export const LOCALES = ['en', 'ar'] as const;
export const messagesFor = (locale: string) => (locale === 'ar' ? ar : en);
export const ogLocale = (locale: string) =>
  locale === 'ar' ? 'ar_LB' : 'en_GB';
/** Canonical and hreflang links. `path` excludes the locale, e.g. '/events'. */
export function localeAlternates(locale: string, path = '') {
  return {
    canonical: '/' + locale + path,
    languages: {
      en: '/en' + path,
      ar: '/ar' + path,
      'x-default': '/en' + path,
    },
  };
}
/** Metadata for static pages; shares the locale's default social image. */
export function pageMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: string;
  path: string;
  title?: string;
  description: string;
}): Metadata {
  const m = messagesFor(locale);
  const image = '/' + locale + '/opengraph-image';
  const socialTitle = title ? title + ' | ' + m.site.short : m.site.name;
  return {
    // An explicit undefined title would replace the layout's default title.
    ...(title && { title }),
    description,
    alternates: localeAlternates(locale, path),
    openGraph: {
      title: socialTitle,
      description,
      siteName: m.site.name,
      locale: ogLocale(locale),
      type: 'website',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [image],
    },
  };
}
