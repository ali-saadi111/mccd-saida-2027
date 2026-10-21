'use client';
import { ViewTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AppLink, Button, Badge, Arrow, EmptyState } from './ui';
import { Photo, PhotoCredit } from './artwork';
import { VenueMap } from './venue-map';
import { EventRow } from './event-row';
import { ShareLinks } from './share-links';
import { usePublicData } from '@/lib/data/hooks';
import { venues } from '@/lib/data/mock';
import { localised, type Event } from '@/lib/data/types';
import { dateLabel, timeLabel } from '@/lib/dates';
import { createICS, downloadFile } from '@/lib/download';
import { venuePhoto } from '@/lib/photos';
export function EventDetail({
  slug,
  initial,
}: {
  slug: string;
  initial: Event | null;
}) {
  const { events, ready } = usePublicData();
  const event = ready
    ? events.find((e) => e.slug === slug && e.status === 'published')
    : initial;
  const t = useTranslations();
  const l = useLocale();
  if (!event)
    return (
      <div className="section container">
        <EmptyState
          title={t('errors.notFoundTitle')}
          action={
            <AppLink href={'/' + l + '/events'}>{t('events.back')}</AppLink>
          }
        />
      </div>
    );
  const venue = venues.find((v) => v.id === event.venue_id)!;
  const title = localised(event, 'title', l);
  const organiser = t.has('content.events.' + event.id + '.organiser')
    ? t('content.events.' + event.id + '.organiser')
    : event.organisation;
  return (
    <div className="event-detail container">
      <div className="back-link">
        <AppLink href={'/' + l + '/events'}>{t('events.back')}</AppLink>
      </div>
      <header className="detail-top">
        <div>
          <div className="flex flex-wrap gap-3">
            <Badge tone="sea">{t('categories.' + event.category)}</Badge>
            <Badge>{t('common.sample')}</Badge>
          </div>
          <ViewTransition
            name={'event-' + event.id}
            default="none"
            share="event-morph"
          >
            <h1>{title}</h1>
          </ViewTransition>
          <p className="text-lead">
            {dateLabel(event.starts_at, l, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <p className="muted mt-3">
            {timeLabel(event.starts_at, l)}–{timeLabel(event.ends_at, l)} ·{' '}
            {localised(venue, 'name', l)}
          </p>
          <div className="mt-7">
            <Button
              variant="secondary"
              onPress={() =>
                downloadFile(
                  createICS(event, venue, l),
                  event.slug + '.ics',
                  'text/calendar;charset=utf-8',
                )
              }
            >
              {t('events.addCalendar')}
              <Arrow />
            </Button>
          </div>
        </div>
        <div className="detail-art">
          <Photo
            src={event.image_url}
            eager
            fallback={venuePhoto[event.venue_id]}
          />
          {!event.image_url && (
            <PhotoCredit photo={venuePhoto[event.venue_id]} />
          )}
        </div>
      </header>
      <div className="detail-body">
        <div>
          <div className="prose">
            <p className="text-lead">{localised(event, 'description', l)}</p>
            <h2>{t('events.accessibility')}</h2>
            <p>{localised(event, 'accessibility', l) || t('common.pending')}</p>
          </div>
          <dl className="detail-facts">
            <div>
              <dt>{t('events.organised')}</dt>
              <dd>{organiser}</dd>
            </div>
            <div>
              <dt>{t('common.language')}</dt>
              <dd>
                {event.language
                  .map((lang) => t('common.' + lang))
                  .join(l === 'ar' ? '، ' : ', ')}
              </dd>
            </div>
            <div>
              <dt>{t('common.audience')}</dt>
              <dd>
                {event.audience
                  .map((a) => t('audiences.' + a))
                  .join(l === 'ar' ? '، ' : ', ')}
              </dd>
            </div>
            <div>
              <dt>{t('events.entry')}</dt>
              <dd>
                {t('common.' + event.entry)}
                {event.entry === 'ticketed' && !event.ticket_url && (
                  <p className="field-hint">{t('common.pending')}</p>
                )}
                {event.ticket_url && /^https?:\/\//i.test(event.ticket_url) && (
                  <AppLink
                    href={event.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('events.tickets')}
                    <Arrow diagonal />
                  </AppLink>
                )}
              </dd>
            </div>
          </dl>
          <ShareLinks title={title} />
        </div>
        <div>
          <p className="eyebrow mb-4">{t('common.venue')}</p>
          <h3 className="mb-6">{localised(venue, 'name', l)}</h3>
          <VenueMap venue={venue} />
          {!event.image_url && (
            <p className="field-hint mt-5">{t('events.photoPlaceholder')}</p>
          )}
        </div>
      </div>
      <section className="section">
        <div className="section-heading">
          <h2>{t('events.more')}</h2>
        </div>
        <div className="event-list">
          {events
            .filter((e) => e.id !== event.id && e.status === 'published')
            .slice(0, 3)
            .map((e) => (
              <EventRow key={e.id} event={e} />
            ))}
        </div>
      </section>
    </div>
  );
}
