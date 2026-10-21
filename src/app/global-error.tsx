'use client';
import { usePathname } from 'next/navigation';
import { Button, ButtonLink, PageIntro } from '@/components/ui';
import en from '@/messages/en.json';
import ar from '@/messages/ar.json';
import './globals.css';
/** Replaces the locale layout when it fails, so it cannot rely on next-intl. */
export default function GlobalError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const locale = usePathname()?.startsWith('/ar') ? 'ar' : 'en';
  const m = locale === 'ar' ? ar : en;
  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body>
        <title>{m.common.error + ' | ' + m.site.short}</title>
        <main className="page-bottom container">
          <PageIntro eyebrow={m.common.error} title={m.errors.title}>
            {m.errors.text}
          </PageIntro>
          <div className="flex flex-wrap gap-4">
            <Button onPress={retry}>{m.common.retry}</Button>
            <ButtonLink href={'/' + locale} variant="secondary">
              {m.common.home}
            </ButtonLink>
          </div>
        </main>
      </body>
    </html>
  );
}
