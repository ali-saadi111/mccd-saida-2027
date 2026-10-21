import type { Metadata } from 'next';
import { Admin } from '@/components/admin';
import { messagesFor, pageMetadata } from '@/lib/metadata';
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = messagesFor(locale);
  return {
    ...pageMetadata({
      locale,
      path: '/admin',
      title: m.nav.admin,
      description: m.home.subtitle,
    }),
    // Stays private after the public launch removes the site-wide noindex.
    robots: { index: false, follow: false },
  };
}
export default function Page() {
  return <Admin />;
}
