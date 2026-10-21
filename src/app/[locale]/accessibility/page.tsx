import type { Metadata } from 'next';
import { LegalPage } from '@/components/static-pages';
import { messagesFor, pageMetadata } from '@/lib/metadata';
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = messagesFor(locale);
  return pageMetadata({
    locale,
    path: '/accessibility',
    title: m.nav.accessibility,
    description: m.legal.accessTitle,
  });
}
export default function Page() {
  return <LegalPage kind="accessibility" />;
}
