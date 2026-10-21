import type { Metadata } from 'next';
import { Programme } from '@/components/programme';
import { messagesFor, pageMetadata } from '@/lib/metadata';
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = messagesFor(locale);
  return pageMetadata({
    locale,
    path: '/events',
    title: m.nav.programme,
    description: m.events.intro,
  });
}
export default function Page() {
  return <Programme />;
}
