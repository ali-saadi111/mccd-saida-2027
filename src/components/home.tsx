'use client';
import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { AppLink, ButtonLink } from './ui';
import { Photo, PhotoCredit } from './artwork';
import { EventCard } from './event-row';
import { NewsGrid } from './news';
import { DayCalendar } from './day-calendar';
import { usePublicData } from '@/lib/data/hooks';
import { filterEvents, publishedNews } from '@/lib/data';
import { HERO_IMAGE, HERO_SOURCES, HERO_VIDEO, YEAR } from '@/lib/config';
import { dateKey, dateLabel, numberLabel } from '@/lib/dates';
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
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
/** The programme: upcoming event cards beside a calendar that narrows them to one day. */
function ProgrammeSection() {
  const t = useTranslations();
  const l = useLocale();
  const { events } = usePublicData();
  const upcoming = filterEvents(events);
  const dates = upcoming.map((e) => dateKey(e.starts_at));
  const [day, setDay] = useState('');
  const [month, setMonth] = useState((dates[0] || YEAR + '-03-06').slice(0, 7));
  const shown = day
    ? upcoming.filter((e) => dateKey(e.starts_at) === day)
    : upcoming.slice(0, 2);
  return (
    <section
      className="plan-band programme-band"
      aria-labelledby="programme-title"
    >
      <Photo src="/photos/plan-by-date.jpg" decorative className="plan-bg" />
      <div className="container">
        <div className="section-heading swapped programme-heading">
          <div>
            <h2 id="programme-title">{t('home.upcoming')}</h2>
            <p>{t('home.upcomingText')}</p>
          </div>
          <AppLink href={'/' + l + '/events'} className="text-link light">
            {t('home.calendar')}
          </AppLink>
        </div>
        <div className="plan-inner">
          <div className="plan-copy">
            <div className="plan-results" aria-live="polite">
              <p className="plan-day">
                <strong>
                  {day
                    ? dateLabel(day, l, {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })
                    : t('home.comingUp')}
                </strong>
                {day && (
                  <span>
                    {t('events.count', {
                      count: shown.length,
                      n: numberLabel(shown.length, l),
                    })}
                    {' · '}
                    <button
                      type="button"
                      className="plan-reset"
                      onClick={() => setDay('')}
                    >
                      {t('home.showUpcoming')}
                    </button>
                  </span>
                )}
              </p>
              {shown.length ? (
                <div className="event-cards programme-cards rail">
                  {shown.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <p className="plan-empty">{t('events.noEventsDay')}</p>
              )}
            </div>
          </div>
          <DayCalendar
            value={day}
            onChange={setDay}
            month={month}
            onMonthChange={setMonth}
            eventDates={dates}
          />
        </div>
      </div>
    </section>
  );
}
/** Highlighter-pen stroke that sweeps across its text once scrolled into view. */
function Highlighter({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [lit, setLit] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setLit(true);
        observer.disconnect();
      },
      { rootMargin: '0px 0px -20% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <strong ref={ref} className="intro-highlight" data-lit={lit || undefined}>
      {children}
    </strong>
  );
}
/** Decorative drone loop; stays on its poster frame for reduced motion or data saver. */
function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    const still =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      (navigator as Navigator & { connection?: { saveData?: boolean } })
        .connection?.saveData;
    if (video && !still) video.play().catch(() => {});
  }, []);
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      className="photo hero-bg"
    />
  );
}
export function Home() {
  const t = useTranslations();
  const l = useLocale();
  const { news } = usePublicData();
  const strandPhotos: PhotoKey[] = ['castle2009', 'alley', 'palaceArch'];
  return (
    <>
      <section className="home-hero">
        {HERO_VIDEO ? (
          <HeroVideo {...HERO_VIDEO} />
        ) : (
          <Photo
            src={HERO_IMAGE}
            sources={HERO_SOURCES}
            fallback="seashore"
            eager
            className="hero-bg"
          />
        )}
        <div className="hero-shade" aria-hidden />
        <div className="hero-content container">
          <div className="hero-main">
            <p className="hero-subtitle">{t('home.subtitle')}</p>
            <h1 className="hero-title">{t('home.programme')}</h1>
            <div className="hero-actions">
              <ButtonLink href={'/' + l + '/events'} variant="light">
                {t('home.discover')}
              </ButtonLink>
              <ButtonLink href={'/' + l + '/submit'} variant="outline-light">
                {t('home.participate')}
              </ButtonLink>
            </div>
          </div>
          <div className="hero-aside">
            <p className="eyebrow">{t('home.eyebrow')}</p>
          </div>
          <a href="#highlights" className="hero-scroll">
            <span>{t('home.scroll')}</span>
          </a>
        </div>
        {!HERO_IMAGE && (
          <PhotoCredit photo="seashore" className="photo-credit on-image" />
        )}
      </section>
      <div className="container">
        <section id="highlights" className="home-intro">
          <p className="eyebrow">{t('site.tagline')}</p>
          <div>
            <p className="intro-statement">
              {t.rich('home.intro', {
                hl: (chunks) => <Highlighter>{chunks}</Highlighter>,
              })}
            </p>
            <AppLink href={'/' + l + '/about'}>{t('home.citiesLink')}</AppLink>
          </div>
        </section>
      </div>
      <ProgrammeSection />
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
            <AppLink href={'/' + l + '/about'}>{t('home.citiesLink')}</AppLink>
          </div>
        </section>
        <section className="section border-t border-line">
          <div className="section-heading centered">
            <div>
              <p className="eyebrow">{t('home.newsLabel')}</p>
              <h2>{t('home.newsTitle')}</h2>
            </div>
            <AppLink href={'/' + l + '/news'}>{t('home.allNews')}</AppLink>
          </div>
          <NewsGrid posts={publishedNews(news).slice(0, 3)} className="rail" />
        </section>
      </div>
      <OrganiserCTA />
    </>
  );
}
