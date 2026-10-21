import type { Metadata } from 'next';
import { LegalPage } from '@/components/static-pages';
import { messagesFor, pageMetadata } from '@/lib/metadata';
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = messagesFor(locale);
  return pageMetadata({
    locale,
    path: '/privacy',
    title: m.nav.privacy,
    description: m.legal.privacyTitle,
  });
}
export default function Page() {
  return <LegalPage kind="privacy" />;
}
