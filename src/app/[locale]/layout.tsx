import type { Metadata, Viewport } from 'next';
import { DM_Sans, Tajawal, Urbanist } from 'next/font/google';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Providers } from '@/components/providers';
import { Header, Footer } from '@/components/shell';
import { SITE_URL } from '@/lib/config';
import '../globals.css';
// Official saida.gov.lb typefaces: DM Sans (English), Tajawal (Arabic).
const sans = DM_Sans({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-dm-sans',
  display: 'swap',
});
// Headings and the hero title: Urbanist, variable weight from thin to bold.
const heroTitle = Urbanist({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-urbanist',
  display: 'swap',
});
const arabic = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-arabic',
  display: 'swap',
});
export const viewport: Viewport = { themeColor: '#f3f3f3' };
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
      className={
        sans.variable + ' ' + heroTitle.variable + ' ' + arabic.variable
      }
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
