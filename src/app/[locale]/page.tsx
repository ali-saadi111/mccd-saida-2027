import type { Metadata } from 'next';
import { Home } from '@/components/home';
import { messagesFor, pageMetadata } from '@/lib/metadata';
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = messagesFor(locale);
  return pageMetadata({ locale, path: '', description: m.home.subtitle });
}
export default function Page() {
  return <Home />;
}
