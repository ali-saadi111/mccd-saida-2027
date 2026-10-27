'use client';
import { ViewTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { AppLink, Badge } from './ui';
import { Photo } from './artwork';
import { dateLabel, timeLabel } from '@/lib/dates';
import { venues } from '@/lib/data/mock';
import { venuePhoto } from '@/lib/photos';
import { localised, type Event } from '@/lib/data/types';
export function EventRow({ event }: { event: Event }) {
  const l = useLocale();
  const t = useTranslations();
  const venue = venues.find((v) => v.id === event.venue_id)!;
  return (
    <motion.article
      layout
      initial={false}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="event-row"
    >
      <time dateTime={event.starts_at} className="event-date">
        <strong>{dateLabel(event.starts_at, l, { day: '2-digit' })}</strong>
        <span>
          {dateLabel(event.starts_at, l, { month: 'short' })}
          <br />
          {dateLabel(event.starts_at, l, { weekday: 'short' })}
        </span>
      </time>
      <div className="event-thumb">
        <Photo
          src={event.image_url}
          fallback={venuePhoto[event.venue_id]}
          decorative
        />
      </div>
      <div>
        <ViewTransition
          name={'event-' + event.id}
          default="none"
          share="event-morph"
        >
          <AppLink
            href={'/' + l + '/events/' + event.slug}
            className="event-title"
          >
            {localised(event, 'title', l)}
          </AppLink>
        </ViewTransition>
        <p className="event-category">
          {t('categories.' + event.category)} · {timeLabel(event.starts_at, l)}
        </p>
      </div>
      <p className="event-location">{localised(venue, 'name', l)}</p>
      <Badge tone={event.entry === 'free' ? 'sea' : 'neutral'}>
        {t('common.' + event.entry)}
      </Badge>
    </motion.article>
  );
}
/** Photographic card for programme highlights. */
export function EventCard({ event }: { event: Event }) {
  const l = useLocale();
  const t = useTranslations();
  const venue = venues.find((v) => v.id === event.venue_id)!;
  return (
    <article className="event-card">
      <div className="event-card-media">
        <Photo
          src={event.image_url}
          fallback={venuePhoto[event.venue_id]}
          decorative
        />
        <time dateTime={event.starts_at} className="event-card-date">
          <strong>{dateLabel(event.starts_at, l, { day: 'numeric' })}</strong>
          <span>{dateLabel(event.starts_at, l, { month: 'short' })}</span>
        </time>
      </div>
      <p className="event-card-meta">
        <span>{t('categories.' + event.category)}</span>
        <span>{t('common.' + event.entry)}</span>
      </p>
      <h3>
        <AppLink
          href={'/' + l + '/events/' + event.slug}
          className="event-card-title"
        >
          {localised(event, 'title', l)}
        </AppLink>
      </h3>
      <p className="event-card-place">
        {dateLabel(event.starts_at, l, { weekday: 'long' })} ·{' '}
        {timeLabel(event.starts_at, l)} · {localised(venue, 'name', l)}
      </p>
    </article>
  );
}
export function EventListSkeleton() {
  return (
    <div aria-busy="true" className="event-list">
      {[1, 2, 3].map((i) => (
        <div className="skeleton-row" key={i}>
          <span className="skeleton-block" />
          <span className="skeleton-block" />
        </div>
      ))}
    </div>
  );
}
