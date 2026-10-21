import { EventListSkeleton } from '@/components/event-row';
export default function Loading() {
  return (
    <div className="section container">
      <EventListSkeleton />
    </div>
  );
}
