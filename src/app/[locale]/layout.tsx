import type { Metadata, Viewport } from 'next';
import {
  Manrope,
  Cormorant_Garamond,
  Noto_Sans_Arabic,
} from 'next/font/google';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Providers } from '@/components/providers';
import { Header, Footer } from '@/components/shell';
import { SITE_URL } from '@/lib/config';
import '../globals.css';
const sans = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});
const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
});
const arabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap',
});
export const viewport: Viewport = { themeColor: '#f7f4ee' };
export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ar' }];
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const m = (
    await import('../../messages/' + (locale === 'ar' ? 'ar' : 'en') + '.json')
  ).default;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: m.site.name, template: '%s | ' + m.site.short },
    description: m.home.subtitle,
    robots: { index: false, follow: false },
  };
}
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!['en', 'ar'].includes(locale)) notFound();
  setRequestLocale(locale);
  const messages = (await import('../../messages/' + locale + '.json')).default;
  return (
    <html
      data-scroll-behavior="smooth"
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className={sans.variable + ' ' + serif.variable + ' ' + arabic.variable}
    >
      <body>
        <Providers locale={locale} messages={messages}>
          <Header />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
