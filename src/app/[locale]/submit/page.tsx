import type { Metadata } from 'next';
import { BookingForm } from '@/components/booking-form';
import { messagesFor, pageMetadata } from '@/lib/metadata';
type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const m = messagesFor(locale);
  return pageMetadata({
    locale,
    path: '/submit',
    title: m.nav.submit,
    description: m.booking.intro,
  });
}
export default function Page() {
  return <BookingForm />;
}
