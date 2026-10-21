import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { BookingForm } from '@/components/booking-form';
import { Contact } from '@/components/contact';
import { Admin } from '@/components/admin';
import { Programme } from '@/components/programme';
import { EventDetail } from '@/components/event-detail';
import { NewsIndex, NewsArticle } from '@/components/news';
import { Home } from '@/components/home';
import { mockEvents, mockNews } from '@/lib/data/mock';
import ErrorScreen from '@/app/[locale]/error';
const meta = {
  title: 'Screens/Interactive compositions',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Use the language toolbar for English/LTR or Arabic/RTL. The booking form supports validation, draft restoration, all four steps, simulated conflicts and confirmation. Admin edits use only this Storybook origin’s local storage. Reset demo data in Admin to return to fixtures. Server Actions are replaced with the same validation schemas in this workshop.',
      },
    },
  },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Booking: Story = { render: () => <BookingForm /> };
export const ArabicBooking: Story = { ...Booking, globals: { locale: 'ar' } };
export const ContactForm: Story = { render: () => <Contact /> };
export const Administration: Story = { render: () => <Admin /> };
export const CalendarAndFilters: Story = { render: () => <Programme /> };
export const EventPage: Story = {
  render: () => (
    <EventDetail slug={mockEvents[0].slug} initial={mockEvents[0]} />
  ),
};
export const NewsList: Story = { render: () => <NewsIndex /> };
export const Article: Story = {
  render: () => <NewsArticle slug={mockNews[0].slug} initial={mockNews[0]} />,
};
export const HomePage: Story = { render: () => <Home /> };
export const RecoverableError: Story = {
  render: () => <ErrorScreen error={new Error('Preview')} retry={() => {}} />,
};
export const ArabicError: Story = {
  ...RecoverableError,
  globals: { locale: 'ar' },
};
