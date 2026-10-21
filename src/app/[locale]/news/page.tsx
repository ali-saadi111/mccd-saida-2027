import type { Metadata } from 'next';
import { NewsIndex } from '@/components/news';
import { messagesFor, pageMetadata } from '@/lib/metadata';
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = messagesFor(locale);
  return pageMetadata({
    locale,
    path: '/news',
    title: m.nav.news,
    description: m.news.intro,
  });
}
export default function Page() {
  return <NewsIndex />;
}
