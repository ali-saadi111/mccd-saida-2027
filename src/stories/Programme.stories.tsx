import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useTranslations } from 'next-intl';
import { ProgrammeCalendar, DateFilter } from '@/components/calendar';
import { EventRow, EventListSkeleton } from '@/components/event-row';
import { Badge, EmptyState, PageIntro } from '@/components/ui';
import { SeaArtwork, ThreadMark } from '@/components/artwork';
import { NewsGrid } from '@/components/news';
import { VenueMap } from '@/components/venue-map';
import { availabilityFor, initialStore } from '@/lib/data/booking';
import { mockEvents, mockNews, venues } from '@/lib/data/mock';
const meta = {
  title: 'Programme/Components',
  tags: ['autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const BookingCalendar: Story = {
  render: function Example() {
    const [value, setValue] = useState('');
    const [month, setMonth] = useState('2027-03');
    return (
      <ProgrammeCalendar
        value={value}
        onChange={setValue}
        month={month}
        onMonthChange={setMonth}
        availability={availabilityFor(
          initialStore().reservations,
          'sea',
          month,
        )}
        booking
      />
    );
  },
};
export const ArabicCalendar: Story = {
  ...BookingCalendar,
  globals: { locale: 'ar' },
};
export const WholeDayCalendar: Story = {
  render: function Example() {
    const [value, setValue] = useState('');
    return (
      <ProgrammeCalendar
        value={value}
        onChange={setValue}
        month="2027-03"
        availability={availabilityFor(
          initialStore().reservations,
          'sea',
          '2027-03',
          'whole-day',
        )}
        booking
      />
    );
  },
};
export const DisabledCalendar: Story = {
  render: () => <ProgrammeCalendar value="" onChange={() => {}} isDisabled />,
};
export const DatePicker: Story = {
  render: function Example() {
    const [date, setDate] = useState('');
    return <DateFilter value={date} onChange={setDate} />;
  },
};
export const Event: Story = {
  render: () => <EventRow event={mockEvents[0]} />,
};
export const Loading: Story = { render: () => <EventListSkeleton /> };
export const Empty: Story = {
  render: function Example() {
    const t = useTranslations();
    return (
      <EmptyState title={t('events.noneTitle')}>
        {t('events.noneText')}
      </EmptyState>
    );
  },
};
export const Badges: Story = {
  render: function Example() {
    const t = useTranslations();
    return (
      <div className="flex gap-4">
        {(['neutral', 'sea', 'red'] as const).map((tone) => (
          <Badge key={tone} tone={tone}>
            {t('common.sample')}
          </Badge>
        ))}
      </div>
    );
  },
};
export const Intro: Story = {
  render: function Example() {
    const t = useTranslations();
    return (
      <PageIntro eyebrow={t('events.eyebrow')} title={t('events.title')}>
        {t('events.intro')}
      </PageIntro>
    );
  },
};
export const News: Story = { render: () => <NewsGrid posts={mockNews} /> };
export const MapPlaceholder: Story = {
  render: () => <VenueMap venue={venues[0]} />,
};
export const Artwork: Story = {
  render: () => (
    <div className="max-w-lg">
      <SeaArtwork />
      <ThreadMark />
    </div>
  ),
};
