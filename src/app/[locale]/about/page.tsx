import type { Metadata } from 'next';
import { About } from '@/components/static-pages';
import { messagesFor, pageMetadata } from '@/lib/metadata';
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = messagesFor(locale);
  return pageMetadata({
    locale,
    path: '/about',
    title: m.nav.about,
    description: m.about.intro,
  });
}
export default function Page() {
  return <About />;
}
