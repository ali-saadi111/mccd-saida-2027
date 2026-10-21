'use client';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { RadioGroup, Radio, Label, FileTrigger } from 'react-aria-components';
import { Check, FilePdf, UploadSimple } from '@phosphor-icons/react';
import { Button } from './ui';
import { Photo } from './artwork';
import { venues } from '@/lib/data/mock';
import { localised } from '@/lib/data/types';
import { venuePhoto } from '@/lib/photos';
import { dateLabel, numberLabel } from '@/lib/dates';
import type { Submission } from '@/lib/schemas/submission';

const accepted = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

/** Object URL for an image file, revoked when the file changes or unmounts. */
export function useImageUrl(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!file?.type.startsWith('image/')) {
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}

export function JourneySteps({
  steps,
  current,
  onJump,
}: {
  steps: readonly string[];
  current: number;
  onJump: (step: number) => void;
}) {
  const t = useTranslations('booking');
  const l = useLocale();
  return (
    <ol
      className="journey-steps"
      aria-label={t('stepCount', {
        current: numberLabel(current + 1, l),
        total: numberLabel(steps.length, l),
      })}
    >
      {steps.map((key, i) => {
        const done = i < current;
        const body = (
          <>
            <span className="journey-marker" aria-hidden>
              {done ? <Check weight="bold" /> : numberLabel(i + 1, l)}
            </span>
            <span className="journey-label">{t('steps.' + key)}</span>
          </>
        );
        return (
          <li
            key={key}
            data-state={done ? 'done' : i === current ? 'current' : 'next'}
            aria-current={i === current ? 'step' : undefined}
          >
            {done ? (
              <button
                type="button"
                className="journey-step"
                onClick={() => onJump(i)}
              >
                {body}
              </button>
            ) : (
              <span className="journey-step">{body}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function VenuePicker({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (venue: string) => void;
  error?: string;
}) {
  const t = useTranslations('booking');
  const l = useLocale();
  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      isInvalid={!!error}
      className="venue-picker"
    >
      <Label className="group-label">{t('venue')}</Label>
      <div className="venue-grid">
        {venues.map((venue) => (
          <Radio key={venue.id} value={venue.id} className="venue-card">
            <span className="venue-card-media">
              <Photo fallback={venuePhoto[venue.id]} decorative />
              <span className="venue-card-check" aria-hidden>
                <Check weight="bold" />
              </span>
            </span>
            <span className="venue-card-name">
              {localised(venue, 'name', l)}
            </span>
          </Radio>
        ))}
      </div>
      {error && <p className="error-text">{error}</p>}
    </RadioGroup>
  );
}

export function UploadZone({
  file,
  imageUrl,
  restored,
  onChange,
}: {
  file: File | null;
  imageUrl: string | null;
  restored: boolean;
  onChange: (file: File | null) => void;
}) {
  const t = useTranslations('booking');
  const [invalid, setInvalid] = useState(false);
  return (
    <div className="upload-zone" data-filled={!!file || undefined}>
      {file ? (
        <div className="upload-file">
          <span className="upload-thumb" aria-hidden>
            {imageUrl ? (
              <img src={imageUrl} alt="" />
            ) : (
              <FilePdf weight="thin" />
            )}
          </span>
          <p className="upload-name">{file.name}</p>
          <Button variant="ghost" size="sm" onPress={() => onChange(null)}>
            {t('removeFile')}
          </Button>
        </div>
      ) : (
        <>
          <span className="upload-icon" aria-hidden>
            <UploadSimple weight="thin" />
          </span>
          <FileTrigger
            acceptedFileTypes={accepted}
            onSelect={(files) => {
              const chosen = files?.[0];
              const valid =
                !!chosen &&
                chosen.size <= 5 * 1024 * 1024 &&
                accepted.includes(chosen.type);
              setInvalid(!valid);
              if (valid) onChange(chosen);
            }}
          >
            <Button variant="secondary">{t('upload')}</Button>
          </FileTrigger>
          <p>{t('uploadHint')}</p>
        </>
      )}
      {restored && !file && <p>{t('fileRestored')}</p>}
      {invalid && (
        <p role="alert" className="error-text">
          {t('fileError')}
        </p>
      )}
    </div>
  );
}

export function ReviewGroups({
  values,
  fileName,
  onEdit,
}: {
  values: Submission;
  fileName: string | null;
  onEdit: (step: number) => void;
}) {
  const t = useTranslations();
  const l = useLocale();
  const venue = venues.find((v) => v.id === values.venue_id)!;
  const groups: [string, number, [string, string][]][] = [
    [
      'idea',
      0,
      [
        [t('booking.titleField'), values.title],
        [t('booking.description'), values.description],
        [t('common.category'), t('categories.' + values.category)],
        [t('booking.upload'), fileName || t('common.dash')],
      ],
    ],
    [
      'audience',
      1,
      [
        [
          t('common.audience'),
          values.audience.map((a) => t('audiences.' + a)).join(' · '),
        ],
        [
          t('common.language'),
          values.language.map((v) => t('common.' + v)).join(' · '),
        ],
        [t('booking.attendance'), numberLabel(values.attendance, l)],
        [t('booking.entry'), t('common.' + values.entry)],
        [
          t('booking.accessibility'),
          values.accessibility || t('common.pending'),
        ],
        [t('booking.website'), values.website || t('common.dash')],
      ],
    ],
    [
      'date',
      2,
      [
        [t('common.venue'), localised(venue, 'name', l)],
        [
          t('common.date'),
          values.date ? dateLabel(values.date, l) : t('booking.notSelected'),
        ],
        [t('common.time'), t('common.' + values.slot)],
      ],
    ],
    [
      'organiser',
      3,
      [
        [t('booking.name'), values.name],
        [t('booking.organisation'), values.organisation],
        [t('booking.email'), values.email],
        [t('booking.phone'), values.phone],
      ],
    ],
  ];
  return (
    <div className="review-groups">
      {groups.map(([key, step, rows]) => {
        const group = t('booking.groups.' + key);
        return (
          <section key={key} className="review-group">
            <div className="review-group-head">
              <h3>{group}</h3>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => onEdit(step)}
                aria-label={t('booking.editGroup', { group })}
              >
                {t('booking.edit')}
              </Button>
            </div>
            <dl>
              {rows.map(([label, value]) => (
                <div className="summary-line" key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}
    </div>
  );
}
