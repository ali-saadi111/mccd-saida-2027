'use client';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm, useWatch, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { RadioGroup, Radio, Label } from 'react-aria-components';
import { Check, LockKey } from '@phosphor-icons/react';
import { clearAnnouncer } from 'react-aria/private/live-announcer/LiveAnnouncer';
import {
  Button,
  ButtonLink,
  Field,
  CheckField,
  AppLink,
  ConfirmDialog,
} from './ui';
import { ProgrammeCalendar } from './calendar';
import { ChipGroup } from './ui/chip-group';
import { Photo, PhotoCredit } from './artwork';
import {
  JourneySteps,
  VenuePicker,
  UploadZone,
  ReviewGroups,
  useImageUrl,
} from './booking-parts';
import { BookingPreview, PreviewCard } from './booking-preview';
import {
  submissionSchema,
  defaultSubmission,
  type Submission,
} from '@/lib/schemas/submission';
import { validateSubmissionAction } from '@/lib/actions';
import {
  createReservation,
  getAvailability,
  DRAFT_KEY,
  type BookingResult,
} from '@/lib/data/booking';
import {
  categories,
  audiences,
  type DayAvailability,
  type Slot,
} from '@/lib/data/types';
import { BOOKING_MODE } from '@/lib/config';
import { dateLabel, numberLabel } from '@/lib/dates';
const steps = ['idea', 'audience', 'date', 'organiser', 'review'] as const;
const last = steps.length - 1;
const stepFields: FieldPath<Submission>[][] = [
  ['title', 'description', 'category'],
  ['audience', 'language', 'attendance', 'entry', 'accessibility', 'website'],
  ['venue_id', 'date', 'slot'],
  ['name', 'organisation', 'email', 'phone'],
  ['consent'],
];
export function BookingForm() {
  const t = useTranslations();
  const l = useLocale();
  const [step, setStep] = useState(0);
  const [month, setMonth] = useState('2027-03');
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [ready, setReady] = useState(false);
  const [draftFailed, setDraftFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const imageUrl = useImageUrl(file);
  const [restoredFile, setRestoredFile] = useState(false);
  const [simulate, setSimulate] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [result, setResult] = useState<BookingResult | null>(null);
  const succeeded = result?.ok === true;
  const [refresh, setRefresh] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const autosave = useRef<ReturnType<typeof setTimeout> | null>(null);
  const form = useForm<Submission>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      ...defaultSubmission,
      slot: BOOKING_MODE === 'whole-day' ? 'whole-day' : 'evening',
    },
    mode: 'onBlur',
  });
  const {
    control,
    trigger,
    setValue,
    reset,
    formState: { errors },
  } = form;
  const values = useWatch({ control }) as Submission;
  const rtl = l === 'ar';
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        const restored = { ...defaultSubmission };
        for (const key of Object.keys(
          defaultSubmission,
        ) as (keyof Submission)[]) {
          if (typeof draft.values?.[key] === typeof defaultSubmission[key])
            Object.assign(restored, { [key]: draft.values[key] });
        }
        restored.consent = false;
        if (!/^2027-\d{2}-\d{2}$/.test(restored.date)) restored.date = '';
        if (BOOKING_MODE === 'whole-day') restored.slot = 'whole-day';
        reset(restored);
        if (restored.date) setMonth(restored.date.slice(0, 7));
        setRestoredFile(!!draft.fileName);
      }
    } catch {
      setDraftFailed(true);
    }
    setReady(true);
  }, [reset]);
  useEffect(() => {
    if (!ready || result?.ok) return;
    if (autosave.current) clearTimeout(autosave.current);
    autosave.current = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ values, fileName: file?.name || null }),
        );
        setDraftFailed(false);
      } catch {
        setDraftFailed(true);
      }
    }, 350);
    return () => {
      if (autosave.current) clearTimeout(autosave.current);
    };
  }, [values, ready, file, result?.ok]);
  useEffect(() => {
    let active = true;
    getAvailability(values.venue_id, month).then((days) => {
      if (active) setAvailability(days);
    });
    const update = () => setRefresh((v) => v + 1);
    window.addEventListener('storage', update);
    window.addEventListener('saida-data', update);
    return () => {
      active = false;
      window.removeEventListener('storage', update);
      window.removeEventListener('saida-data', update);
    };
  }, [values.venue_id, month, refresh]);
  useEffect(() => {
    if (step > 0 || succeeded) {
      // React Aria retains labelled announcements for seven seconds. Clear
      // references to the previous step's unmounted labels before moving focus.
      clearAnnouncer('polite');
      clearAnnouncer('assertive');
      heading.current?.focus();
    }
  }, [step, succeeded]);
  const err = (name: keyof Submission) =>
    errors[name]?.message
      ? t('validation.' + errors[name]?.message)
      : undefined;
  // Once a field shows an error, re-check it as it changes so the message
  // clears while typing rather than on blur, which would shift the layout
  // under a pointer already pressing "Next step" and cancel the press.
  const recheck = (name: FieldPath<Submission>) => {
    if (errors[name as keyof Submission]) void trigger(name);
  };
  const textField = (
    name:
      | 'title'
      | 'description'
      | 'accessibility'
      | 'website'
      | 'name'
      | 'organisation'
      | 'email'
      | 'phone',
    label: string,
    multiline = false,
    type = 'text',
    required = false,
  ) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Field
          name={name}
          label={label}
          value={field.value}
          onChange={(v) => {
            field.onChange(v);
            recheck(name);
          }}
          onBlur={field.onBlur}
          inputRef={field.ref}
          multiline={multiline}
          type={type}
          isRequired={required}
          error={err(name)}
          autoComplete={
            ['name', 'email', 'organisation', 'phone'].includes(name)
              ? name === 'organisation'
                ? 'organization'
                : name === 'phone'
                  ? 'tel'
                  : name
              : undefined
          }
        />
      )}
    />
  );
  const selectedDay = availability.find((d) => d.date === values.date);
  const changeDate = (date: string) => {
    setValue('date', date, { shouldValidate: true });
    const available = availability
      .find((d) => d.date === date)
      ?.slots.find((s) => s.available);
    if (available) setValue('slot', available.slot, { shouldValidate: true });
  };
  const next = async () => {
    setSubmitError('');
    if (await trigger(stepFields[step], { shouldFocus: true })) {
      if (steps[step] === 'date') {
        const days = await getAvailability(
          values.venue_id,
          values.date.slice(0, 7),
        );
        const slot = days
          .find((d) => d.date === values.date)
          ?.slots.find((s) => s.slot === values.slot);
        if (!slot?.available) {
          form.setError('date', { message: 'date' });
          return;
        }
      }
      setStep((s) => s + 1);
    }
  };
  const submit = async (data: Submission) => {
    setBusy(true);
    setSubmitError('');
    try {
      const validation = await validateSubmissionAction(data);
      if (!validation.valid) {
        setSubmitError(t('booking.errorSummary'));
        return;
      }
      const booking = await createReservation(
        data,
        l,
        simulate,
        file?.name || null,
      );
      setResult(booking);
      setSimulate(false);
      setRefresh((v) => v + 1);
      if (booking.ok) {
        if (autosave.current) clearTimeout(autosave.current);
        localStorage.removeItem(DRAFT_KEY);
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    } catch {
      setSubmitError(t('booking.formError'));
    } finally {
      setBusy(false);
    }
  };
  const clearDraft = () => setClearOpen(true);
  const chips = (
    name: 'audience' | 'language',
    label: string,
    options: { value: string; label: string }[],
  ) => (
    <div className="field-group">
      <p className="group-label" aria-hidden>
        {label}
      </p>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <ChipGroup
            label={label}
            multiple
            rtl={rtl}
            options={options}
            value={field.value}
            onValueChange={(v) => {
              field.onChange(v);
              recheck(name);
            }}
          />
        )}
      />
      {err(name) && <p className="error-text">{err(name)}</p>}
    </div>
  );
  if (result?.ok)
    return (
      <div className="container">
        <section className="success-page" aria-live="polite">
          <div className="success-copy">
            <div className="success-icon">
              <Check weight="thin" />
            </div>
            <p className="eyebrow">{t('booking.successLabel')}</p>
            <h1 ref={heading} tabIndex={-1}>
              {t('booking.successTitle')}
            </h1>
            <p>{t('booking.successText')}</p>
            <div className="notice mb-8">{t('booking.demoSuccess')}</div>
            <dl className="detail-facts mb-8 text-start">
              <div>
                <dt>{t('booking.reference')}</dt>
                <dd>{result.reservation.id.slice(0, 8).toUpperCase()}</dd>
              </div>
              <div>
                <dt>{t('common.date')}</dt>
                <dd>{dateLabel(result.reservation.date, l)}</dd>
              </div>
              <div>
                <dt>{t('common.time')}</dt>
                <dd>{t('common.' + result.reservation.slot)}</dd>
              </div>
            </dl>
            <div className="success-actions">
              <ButtonLink href={'/' + l + '/events'}>
                {t('events.back')}
              </ButtonLink>
              <Button
                variant="secondary"
                onPress={() => {
                  reset(defaultSubmission);
                  setStep(0);
                  setResult(null);
                  setFile(null);
                  setMonth('2027-03');
                }}
              >
                {t('booking.another')}
              </Button>
            </div>
          </div>
          <div className="success-card">
            <PreviewCard values={values} imageUrl={imageUrl} />
          </div>
        </section>
      </div>
    );
  return (
    <div className="container">
      <header className="submit-hero">
        <Photo fallback="khan" eager decorative className="submit-hero-bg" />
        <div className="submit-hero-shade" aria-hidden />
        <div className="submit-hero-content">
          <p className="eyebrow">{t('booking.eyebrow')}</p>
          <h1>{t('booking.title')}</h1>
          <p className="submit-hero-intro">{t('booking.intro')}</p>
          <p className="submit-hero-meta">{t('booking.meta')}</p>
        </div>
        <PhotoCredit photo="khan" className="photo-credit on-image" />
      </header>
      <JourneySteps
        steps={steps}
        current={step}
        onJump={(i) => {
          setStep(i);
          setSubmitError('');
        }}
      />
      <div className="form-layout">
        <form
          className="form-panel"
          noValidate
          onSubmit={
            step === last
              ? form.handleSubmit(submit, () =>
                  setSubmitError(t('booking.errorSummary')),
                )
              : (e) => {
                  e.preventDefault();
                  void next();
                }
          }
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <p className="form-step-count">
                {t('booking.stepCount', {
                  current: numberLabel(step + 1, l),
                  total: numberLabel(steps.length, l),
                })}
              </p>
              <h2 ref={heading} tabIndex={-1}>
                {t('booking.' + steps[step] + 'Title')}
              </h2>
              <div className="form-fields">
                {steps[step] === 'idea' && (
                  <>
                    {textField(
                      'title',
                      t('booking.titleField'),
                      false,
                      'text',
                      true,
                    )}
                    {textField(
                      'description',
                      t('booking.description'),
                      true,
                      'text',
                      true,
                    )}
                    <div className="field-group">
                      <p className="group-label" aria-hidden>
                        {t('common.category')}
                      </p>
                      <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                          <ChipGroup
                            label={t('common.category')}
                            rtl={rtl}
                            options={categories.map((id) => ({
                              value: id,
                              label: t('categories.' + id),
                            }))}
                            value={[field.value]}
                            onValueChange={(v) => v[0] && field.onChange(v[0])}
                          />
                        )}
                      />
                      {err('category') && (
                        <p className="error-text">{err('category')}</p>
                      )}
                    </div>
                    <UploadZone
                      file={file}
                      imageUrl={imageUrl}
                      restored={restoredFile}
                      onChange={(chosen) => {
                        setFile(chosen);
                        setRestoredFile(false);
                      }}
                    />
                  </>
                )}
                {steps[step] === 'audience' && (
                  <>
                    {chips(
                      'audience',
                      t('common.audience'),
                      audiences.map((id) => ({
                        value: id,
                        label: t('audiences.' + id),
                      })),
                    )}
                    {chips(
                      'language',
                      t('common.language'),
                      ['ar', 'en', 'fr'].map((id) => ({
                        value: id,
                        label: t('common.' + id),
                      })),
                    )}
                    <div className="two-fields">
                      <Controller
                        name="attendance"
                        control={control}
                        render={({ field }) => (
                          <Field
                            label={t('booking.attendance')}
                            value={
                              Number.isNaN(field.value)
                                ? ''
                                : String(field.value)
                            }
                            onChange={(v) => {
                              field.onChange(v === '' ? NaN : Number(v));
                              recheck('attendance');
                            }}
                            inputRef={field.ref}
                            type="number"
                            isRequired
                            error={err('attendance')}
                          />
                        )}
                      />
                      <div className="field-group">
                        <p className="group-label" aria-hidden>
                          {t('booking.entry')}
                        </p>
                        <Controller
                          name="entry"
                          control={control}
                          render={({ field }) => (
                            <ChipGroup
                              label={t('booking.entry')}
                              rtl={rtl}
                              options={['free', 'ticketed'].map((id) => ({
                                value: id,
                                label: t('common.' + id),
                              }))}
                              value={[field.value]}
                              onValueChange={(v) =>
                                v[0] && field.onChange(v[0])
                              }
                            />
                          )}
                        />
                      </div>
                    </div>
                    {textField(
                      'accessibility',
                      t('booking.accessibility'),
                      true,
                    )}
                    {textField('website', t('booking.website'), false, 'url')}
                  </>
                )}
                {steps[step] === 'date' && (
                  <>
                    <Controller
                      name="venue_id"
                      control={control}
                      render={({ field }) => (
                        <VenuePicker
                          value={field.value}
                          onChange={(v) => {
                            field.onChange(v);
                            setValue('date', '');
                          }}
                          error={err('venue_id')}
                        />
                      )}
                    />
                    <p className="field-hint">
                      {t(
                        BOOKING_MODE === 'whole-day'
                          ? 'booking.wholeDayHint'
                          : 'booking.calendarHint',
                      )}
                    </p>
                    <ProgrammeCalendar
                      value={values.date}
                      onChange={changeDate}
                      month={month}
                      onMonthChange={setMonth}
                      availability={availability}
                      booking
                    />
                    {err('date') && (
                      <p className="error-text" role="alert">
                        {err('date')}
                      </p>
                    )}
                    {values.date && (
                      <p>
                        {t('booking.selectedDate')}:{' '}
                        <strong>
                          {dateLabel(values.date, l, {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })}
                        </strong>
                      </p>
                    )}
                    {BOOKING_MODE === 'time-slots' && values.date && (
                      <Controller
                        name="slot"
                        control={control}
                        render={({ field }) => (
                          <RadioGroup
                            value={field.value}
                            onChange={field.onChange}
                            className="form-fields"
                          >
                            <Label className="group-label">
                              {t('booking.chooseSlot')}
                            </Label>
                            <div className="slot-grid">
                              {selectedDay?.slots.map((s) => (
                                <Radio
                                  key={s.slot}
                                  value={s.slot}
                                  isDisabled={!s.available}
                                  className="slot-radio"
                                >
                                  <strong>{t('common.' + s.slot)}</strong>
                                  <small>
                                    {t(
                                      'common.' +
                                        (!s.available
                                          ? 'booked'
                                          : field.value === s.slot
                                            ? 'selected'
                                            : 'available'),
                                    )}
                                  </small>
                                </Radio>
                              ))}
                            </div>
                          </RadioGroup>
                        )}
                      />
                    )}
                  </>
                )}
                {steps[step] === 'organiser' && (
                  <>
                    <p className="notice flex gap-3">
                      <LockKey weight="thin" className="mt-1 shrink-0" />
                      {t('booking.private')}
                    </p>
                    {textField('name', t('booking.name'), false, 'text', true)}
                    {textField(
                      'organisation',
                      t('booking.organisation'),
                      false,
                      'text',
                      true,
                    )}
                    <div className="two-fields">
                      {textField(
                        'email',
                        t('booking.email'),
                        false,
                        'email',
                        true,
                      )}
                      {textField(
                        'phone',
                        t('booking.phone'),
                        false,
                        'tel',
                        true,
                      )}
                    </div>
                  </>
                )}
                {steps[step] === 'review' && (
                  <>
                    <ReviewGroups
                      values={values}
                      fileName={file?.name || null}
                      onEdit={(i) => {
                        setStep(i);
                        setSubmitError('');
                      }}
                    />
                    <Controller
                      name="consent"
                      control={control}
                      render={({ field }) => (
                        <CheckField
                          isSelected={field.value}
                          onChange={field.onChange}
                        >
                          {t('booking.consent')}
                        </CheckField>
                      )}
                    />
                    {err('consent') && (
                      <p role="alert" className="error-text">
                        {err('consent')}
                      </p>
                    )}
                    <AppLink href={'/' + l + '/privacy'} target="_blank">
                      {t('booking.privacy')}
                    </AppLink>
                    <div className="border-t border-line pt-4">
                      <CheckField isSelected={simulate} onChange={setSimulate}>
                        {t('booking.simulate')}
                      </CheckField>
                      <p className="field-hint">{t('booking.simulateHint')}</p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
          {submitError && (
            <p role="alert" className="error-text mt-5">
              {submitError}
            </p>
          )}
          <div className="form-actions">
            {step > 0 ? (
              <Button
                variant="ghost"
                onPress={() => {
                  setStep((s) => s - 1);
                  setSubmitError('');
                }}
                isDisabled={busy}
              >
                {t('booking.previous')}
              </Button>
            ) : (
              <span />
            )}
            {/* Distinct keys: reusing one <button> lets the click that ends
                "Next step" land on it after it has become the submit button. */}
            {step < last ? (
              <Button key="next" onPress={next}>
                {t('booking.next')}
              </Button>
            ) : (
              <Button key="submit" type="submit" isPending={busy}>
                {t(busy ? 'booking.submitting' : 'booking.submit')}
              </Button>
            )}
          </div>
        </form>
        <BookingPreview
          values={values}
          imageUrl={imageUrl}
          draftFailed={draftFailed}
          onClear={clearDraft}
        />
      </div>
      <ConfirmDialog
        open={clearOpen}
        onClose={() => setClearOpen(false)}
        title={t('booking.clearDraft')}
        confirmLabel={t('booking.clearDraft')}
        onConfirm={() => {
          if (autosave.current) clearTimeout(autosave.current);
          reset(defaultSubmission);
          localStorage.removeItem(DRAFT_KEY);
          setStep(0);
          setFile(null);
          setRestoredFile(false);
          setClearOpen(false);
        }}
      >
        {t('legal.privacy3')}
      </ConfirmDialog>
      <ConfirmDialog
        open={result?.ok === false}
        onClose={() => setResult(null)}
        title={t('booking.conflictTitle')}
        confirmLabel={t('booking.differentDate')}
        onConfirm={() => {
          setResult(null);
          setStep(steps.indexOf('date'));
        }}
      >
        <p>{t('booking.conflictText')}</p>
        <h3 className="mt-6 mb-4 text-lead">{t('booking.alternatives')}</h3>
        {result?.ok === false &&
          result.alternatives.map((option) => (
            <div className="alternative" key={option.date + option.slot}>
              <p>
                {dateLabel(option.date, l)}
                <br />
                <span className="field-hint">{t('common.' + option.slot)}</span>
              </p>
              <Button
                variant="secondary"
                size="sm"
                onPress={() => {
                  setValue('date', option.date);
                  setValue('slot', option.slot as Slot);
                  setMonth(option.date.slice(0, 7));
                  setResult(null);
                  setRefresh((v) => v + 1);
                }}
              >
                {t('booking.chooseAlternative')}
              </Button>
            </div>
          ))}
        {result?.ok === false && !result.alternatives.length && (
          <p>{t('booking.noAlternatives')}</p>
        )}
      </ConfirmDialog>
    </div>
  );
}
