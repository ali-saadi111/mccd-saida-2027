'use client';
import { useId, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CaretDown } from '@phosphor-icons/react';
import { Button } from './ui';
import { Photo } from './artwork';
import { venues } from '@/lib/data/mock';
import { localised } from '@/lib/data/types';
import { venuePhoto } from '@/lib/photos';
import { dateLabel } from '@/lib/dates';
import type { Submission } from '@/lib/schemas/submission';

/** The submission drawn as it will appear among the programme's event cards. */
export function PreviewCard({
  values,
  imageUrl,
}: {
  values: Submission;
  imageUrl: string | null;
}) {
  const t = useTranslations();
  const l = useLocale();
  const venue = venues.find((v) => v.id === values.venue_id)!;
  return (
    <article className="event-card preview-card">
      <div className="event-card-media">
        <Photo src={imageUrl} fallback={venuePhoto[venue.id]} decorative />
        {values.date ? (
          <time dateTime={values.date} className="event-card-date">
            <strong>{dateLabel(values.date, l, { day: 'numeric' })}</strong>
            <span>{dateLabel(values.date, l, { month: 'short' })}</span>
          </time>
        ) : (
          <span className="event-card-date" aria-hidden>
            <strong>–</strong>
            <span>&nbsp;</span>
          </span>
        )}
      </div>
      <p className="event-card-meta">
        <span>{t('categories.' + values.category)}</span>
        <span>{t('common.' + values.entry)}</span>
      </p>
      <h3 data-empty={!values.title || undefined}>
        {values.title || t('booking.untitled')}
      </h3>
      <p className="event-card-place">
        {values.date
          ? dateLabel(values.date, l, { weekday: 'long' })
          : t('booking.pickDate')}{' '}
        · {localised(venue, 'name', l)}
      </p>
    </article>
  );
}

export function BookingPreview({
  values,
  imageUrl,
  draftFailed,
  onClear,
}: {
  values: Submission;
  imageUrl: string | null;
  draftFailed: boolean;
  onClear: () => void;
}) {
  const t = useTranslations('booking');
  const l = useLocale();
  const [open, setOpen] = useState(false);
  const id = useId();
  const venue = venues.find((v) => v.id === values.venue_id)!;
  return (
    <aside className="journey-preview" aria-label={t('summary')}>
      <button
        type="button"
        className="preview-toggle"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="preview-toggle-text">
          <strong>{values.title || t('untitled')}</strong>
          <span>
            {localised(venue, 'name', l)} ·{' '}
            {values.date ? dateLabel(values.date, l) : t('pickDate')}
          </span>
        </span>
        <span className="preview-toggle-action">
          {t(open ? 'hidePreview' : 'showPreview')}
          <CaretDown weight="bold" aria-hidden />
        </span>
      </button>
      <div id={id} className="preview-body" data-open={open || undefined}>
        <p className="eyebrow">{t('summary')}</p>
        <PreviewCard values={values} imageUrl={imageUrl} />
        <p className="field-hint">{t('previewHint')}</p>
      </div>
      <div className="preview-draft">
        <p className="draft-status" aria-live="polite">
          {t(draftFailed ? 'draftFailed' : 'draftSaved')}
        </p>
        <Button variant="ghost" size="sm" onPress={onClear}>
          {t('clearDraft')}
        </Button>
      </div>
    </aside>
  );
}
