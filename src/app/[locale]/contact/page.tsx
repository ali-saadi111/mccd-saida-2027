import type { Metadata } from 'next';
import { Contact } from '@/components/contact';
import { messagesFor, pageMetadata } from '@/lib/metadata';
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = messagesFor(locale);
  return pageMetadata({
    locale,
    path: '/contact',
    title: m.nav.contact,
    description: m.contact.intro,
  });
}
export default function Page() {
  return <Contact />;
}
