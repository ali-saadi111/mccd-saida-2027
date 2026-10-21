'use client';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AppLink, ButtonLink, Arrow } from './ui';
import { Photo, PhotoCredit } from './artwork';
import { EventCard } from './event-row';
import { NewsGrid } from './news';
import { DayCalendar } from './day-calendar';
import { usePublicData } from '@/lib/data/hooks';
import { filterEvents, publishedNews } from '@/lib/data';
import { venues } from '@/lib/data/mock';
import { localised } from '@/lib/data/types';
import { HERO_IMAGE, YEAR } from '@/lib/config';
import { dateKey, numberLabel, timeLabel } from '@/lib/dates';
import type { PhotoKey } from '@/lib/photos';
export function OrganiserCTA() {
  const t = useTranslations();
  const l = useLocale();
  return (
    <section className="cta">
      <div className="cta-inner container">
        <div>
          <p className="eyebrow">{t('home.ctaLabel')}</p>
          <h2>{t('home.ctaTitle')}</h2>
        </div>
        <div>
          <p>{t('home.ctaText')}</p>
          <ButtonLink href={'/' + l + '/submit'} variant="light">
            {t('nav.submit')}
            <Arrow />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
function PlanByDate() {
  const t = useTranslations();
  const l = useLocale();
  const { events } = usePublicData();
  const upcoming = filterEvents(events);
  const dates = upcoming.map((e) => dateKey(e.starts_at));
  const [day, setDay] = useState(dates[0] || YEAR + '-03-06');
  const [month, setMonth] = useState(day.slice(0, 7));
  const onDay = upcoming.filter((e) => dateKey(e.starts_at) === day);
  return (
    <section className="plan-band" aria-labelledby="plan-title">
      <Photo fallback="castleSea" decorative className="plan-bg" />
      <div className="plan-inner container">
        <div className="plan-copy">
          <p className="eyebrow">{t('home.planLabel')}</p>
          <h2 id="plan-title">{t('home.planTitle')}</h2>
          <p className="plan-text">{t('home.planText')}</p>
          <div aria-live="polite">
            {onDay.length ? (
              <ul className="plan-list">
                {onDay.map((e) => (
                  <li key={e.id}>
                    <span className="plan-time">
                      {timeLabel(e.starts_at, l)}
                    </span>
                    <span>
                      <AppLink
                        href={'/' + l + '/events/' + e.slug}
                        className="plan-title"
                      >
                        {localised(e, 'title', l)}
                      </AppLink>
                      <small>
                        {localised(
                          venues.find((v) => v.id === e.venue_id)!,
                          'name',
                          l,
                        )}
                      </small>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="plan-empty">{t('events.noEventsDay')}</p>
            )}
          </div>
          <AppLink href={'/' + l + '/events'} className="text-link light">
            {t('home.calendar')}
            <Arrow />
          </AppLink>
        </div>
        <DayCalendar
          value={day}
          onChange={setDay}
          month={month}
          onMonthChange={setMonth}
          eventDates={dates}
          footer={
            <p className="text-sm text-white/75">
              {t('calendar.dayEvents', {
                count: onDay.length,
                n: numberLabel(onDay.length, l),
              })}
            </p>
          }
        />
      </div>
      <PhotoCredit photo="castleSea" className="photo-credit on-image" />
    </section>
  );
}
export function Home() {
  const t = useTranslations();
  const l = useLocale();
  const { events, news } = usePublicData();
  const facts: [number, string, Intl.NumberFormatOptions?][] = [
    [YEAR, 'factYear', { useGrouping: false }],
    [2, 'factCities'],
    [3, 'factStrands'],
    [12, 'factMonths'],
  ];
  const strandPhotos: PhotoKey[] = ['castle2009', 'alley', 'palaceArch'];
  return (
    <>
      <section className="home-hero">
        <Photo src={HERO_IMAGE} fallback="seashore" eager className="hero-bg" />
        <div className="hero-shade" aria-hidden />
        <div className="hero-content container">
          <p className="eyebrow">{t('home.eyebrow')}</p>
          <h1>
            {t('home.title1')} <em>{t('home.title2')}</em>
          </h1>
          <p className="hero-subtitle">{t('home.subtitle')}</p>
          <div className="hero-actions">
            <ButtonLink href={'/' + l + '/events'} variant="light">
              {t('home.discover')}
              <Arrow />
            </ButtonLink>
            <ButtonLink href={'/' + l + '/submit'} variant="outline-light">
              {t('home.participate')}
            </ButtonLink>
          </div>
        </div>
        {!HERO_IMAGE && (
          <PhotoCredit photo="seashore" className="photo-credit on-image" />
        )}
      </section>
      <div className="container">
        <section className="facts" aria-label={t('home.factsLabel')}>
          {facts.map(([value, key, options]) => (
            <div key={key} className="fact">
              <strong>{numberLabel(value, l, options)}</strong>
              <span>{t('home.' + key)}</span>
            </div>
          ))}
        </section>
        <section className="home-intro">
          <p className="eyebrow">{t('site.tagline')}</p>
          <div>
            <p className="intro-statement">{t('home.intro')}</p>
            <AppLink href={'/' + l + '/about'}>
              {t('home.citiesLink')}
              <Arrow />
            </AppLink>
          </div>
        </section>
        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t('home.upcomingLabel')}</p>
              <h2>{t('home.upcoming')}</h2>
              <p className="muted">{t('home.upcomingText')}</p>
            </div>
            <AppLink href={'/' + l + '/events'}>
              {t('home.calendar')}
              <Arrow />
            </AppLink>
          </div>
          <div className="event-cards">
            {filterEvents(events)
              .slice(0, 3)
              .map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
          </div>
        </section>
      </div>
      <PlanByDate />
      <section className="theme-section section">
        <div className="container">
          <div className="theme-top">
            <div>
              <p className="eyebrow">{t('home.themeLabel')}</p>
              <h2>{t('home.themeTitle')}</h2>
            </div>
            <p>{t('home.themeIntro')}</p>
          </div>
          <div className="strands">
            {[1, 2, 3].map((n) => (
              <article className="strand" key={n}>
                <div className="strand-media">
                  <Photo fallback={strandPhotos[n - 1]} />
                </div>
                <span>{numberLabel(n, l, { minimumIntegerDigits: 2 })}</span>
                <h3>{t('home.strand' + n)}</h3>
                <p>{t('home.strand' + n + 'Text')}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <div className="container">
        <section className="section cities">
          <figure className="cities-media">
            <Photo fallback="viewCastle" />
            <figcaption>
              <PhotoCredit photo="viewCastle" />
            </figcaption>
          </figure>
          <div>
            <p className="eyebrow">{t('home.citiesLabel')}</p>
            <h2>{t('home.citiesTitle')}</h2>
            <p>{t('home.citiesText')}</p>
            <dl className="cities-pair">
              <div>
                <dt>{t('home.saida')}</dt>
                <dd>{t('home.lebanon')}</dd>
              </div>
              <div>
                <dt>{t('home.cordoba')}</dt>
                <dd>{t('home.spain')}</dd>
              </div>
            </dl>
            <AppLink href={'/' + l + '/about'}>
              {t('home.citiesLink')}
              <Arrow />
            </AppLink>
          </div>
        </section>
        <section className="section border-t border-line">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t('home.newsLabel')}</p>
              <h2>{t('home.newsTitle')}</h2>
            </div>
            <AppLink href={'/' + l + '/news'}>
              {t('home.allNews')}
              <Arrow />
            </AppLink>
          </div>
          <NewsGrid posts={publishedNews(news).slice(0, 3)} />
        </section>
      </div>
      <OrganiserCTA />
    </>
  );
}
