'use client';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ChatsCircle,
  CheckCircle,
  EnvelopeSimple,
  Handshake,
  Lightbulb,
  MapPin,
} from '@phosphor-icons/react';
import { Field, Button, ButtonLink, Arrow } from './ui';
import { RadioCards } from './ui/radio-cards';
import { Photo } from './artwork';
import { contactSchema, type ContactInput } from '@/lib/schemas/submission';
import { contactAction } from '@/lib/actions';
const topics = [
  ['proposals', Lightbulb],
  ['partnerships', Handshake],
  ['general', ChatsCircle],
] as const;
export function Contact() {
  const t = useTranslations();
  const l = useLocale();
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', topic: 'general', message: '' },
  });
  return (
    <div className="page-bottom container">
      <header className="contact-hero">
        <div>
          <p className="eyebrow">{t('contact.eyebrow')}</p>
          <h1>{t('contact.title')}</h1>
        </div>
        <p className="intro-text">{t('contact.intro')}</p>
      </header>
      <div className="contact-layout">
        <div className="contact-card">
          {sent ? (
            <div role="status" className="contact-success">
              <CheckCircle
                weight="thin"
                className="contact-success-icon"
                aria-hidden
              />
              <h2>{t('contact.success')}</h2>
              <p className="muted">{t('contact.successText')}</p>
              <Button
                variant="secondary"
                onPress={() => {
                  reset();
                  setSent(false);
                }}
              >
                {t('contact.again')}
              </Button>
            </div>
          ) : (
            <form
              noValidate
              onSubmit={handleSubmit(async (data) => {
                try {
                  const result = await contactAction(data);
                  if (result.valid) setSent(true);
                  else setFailed(true);
                } catch {
                  setFailed(true);
                }
              })}
            >
              <div className="contact-form-head">
                <h2>{t('contact.formTitle')}</h2>
                <p className="muted">{t('contact.formIntro')}</p>
              </div>
              <div className="contact-fields">
                <div className="contact-row">
                  {(['name', 'email'] as const).map((name) => (
                    <Controller
                      key={name}
                      name={name}
                      control={control}
                      render={({ field }) => (
                        <Field
                          label={t('booking.' + name)}
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          inputRef={field.ref}
                          name={name}
                          type={name === 'email' ? 'email' : 'text'}
                          isRequired
                          autoComplete={name}
                          error={
                            errors[name] &&
                            t('validation.' + errors[name].message)
                          }
                        />
                      )}
                    />
                  ))}
                </div>
                <Controller
                  control={control}
                  name="topic"
                  render={({ field }) => (
                    <RadioCards
                      label={t('contact.topic')}
                      value={field.value}
                      onChange={field.onChange}
                      options={topics.map(([id, Icon]) => ({
                        value: id,
                        title: t('contact.' + id),
                        description: t('contact.' + id + 'Text'),
                        icon: <Icon weight="thin" />,
                      }))}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="message"
                  render={({ field }) => (
                    <Field
                      label={t('contact.message')}
                      value={field.value}
                      onChange={field.onChange}
                      multiline
                      isRequired
                      error={
                        errors.message &&
                        t('validation.' + errors.message.message)
                      }
                    />
                  )}
                />
                <p className="notice">{t('site.demo')}</p>
                {failed && (
                  <p role="alert" className="error-text">
                    {t('common.error')}
                  </p>
                )}
                <div className="contact-submit">
                  <Button type="submit" isPending={isSubmitting}>
                    {t(isSubmitting ? 'contact.sending' : 'contact.send')}
                    <Arrow diagonal />
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
        <aside className="contact-aside">
          <section className="contact-tile">
            <span className="contact-tile-icon" aria-hidden>
              <EnvelopeSimple weight="thin" />
            </span>
            <p className="eyebrow">{t('contact.emailTitle')}</p>
            <h2 className="contact-tile-title">{t('site.email')}</h2>
            <p className="muted">{t('contact.emailText')}</p>
          </section>
          <section className="contact-tile contact-place">
            <Photo fallback="seashore" decorative />
            <div className="contact-place-body">
              <p className="eyebrow">{t('contact.visitTitle')}</p>
              <h2 className="contact-tile-title">
                <MapPin weight="fill" aria-hidden />
                {t('contact.visit')}
              </h2>
            </div>
          </section>
          <section className="contact-tile">
            <h2 className="contact-tile-title">{t('contact.organisers')}</h2>
            <p className="muted">{t('contact.organisersText')}</p>
            <ButtonLink
              href={'/' + l + '/submit'}
              variant="secondary"
              size="sm"
            >
              {t('nav.submit')}
              <Arrow />
            </ButtonLink>
          </section>
        </aside>
      </div>
    </div>
  );
}
