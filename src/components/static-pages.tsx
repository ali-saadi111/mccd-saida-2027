'use client';
import { useLocale, useTranslations } from 'next-intl';
import { MotionConfig } from 'motion/react';
import { PageIntro, ButtonLink } from './ui';
import { ScrollChapters } from './ui/scroll-chapters';
import { Photo, PhotoCredit, ThreadMark } from './artwork';
import { photos, type PhotoKey } from '@/lib/photos';
import { numberLabel } from '@/lib/dates';
import { YEAR } from '@/lib/config';
import { OrganiserCTA } from './home';
export function About() {
  const t = useTranslations();
  const l = useLocale();
  const photoKeys = Object.keys(photos) as PhotoKey[];
  return (
    // Motion honours reduced motion itself, so server and client render the same markup.
    <MotionConfig reducedMotion="user">
      <div className="container">
        <header className="about-hero">
          <div>
            <p className="eyebrow">{t('about.eyebrow')}</p>
            <h1>{t('about.title')}</h1>
          </div>
          <p className="intro-text">{t('about.intro')}</p>
        </header>
        <figure className="about-banner">
          <Photo fallback="castlePano" eager />
          <figcaption>
            <PhotoCredit photo="castlePano" />
          </figcaption>
        </figure>

        <section className="section about-story" aria-labelledby="story-title">
          <div className="about-section-head">
            <p className="eyebrow">{t('about.storyLabel')}</p>
            <h2 id="story-title">{t('about.storyTitle')}</h2>
          </div>
          <ScrollChapters
            locale={l}
            chapters={[
              {
                id: 'initiative',
                title: t('about.initiativeTitle'),
                body: <p>{t('about.initiativeText')}</p>,
                media: <Photo fallback="khan" decorative />,
              },
              {
                id: 'designation',
                title: t('about.designationTitle'),
                body: <p>{t('about.designationText')}</p>,
                media: <Photo fallback="viewCastle" decorative />,
              },
              {
                id: 'theme',
                title: t('about.themeTitle'),
                body: (
                  <>
                    <p>{t('about.themeText')}</p>
                    <ul className="chapter-strands">
                      {[1, 2, 3].map((n) => (
                        <li key={n}>
                          <span aria-hidden>{numberLabel(n, l)}</span>
                          {t('home.strand' + n)}
                        </li>
                      ))}
                    </ul>
                  </>
                ),
                media: <Photo fallback="seashore" decorative />,
              },
            ]}
          />
        </section>

        <section
          className="section about-cities"
          aria-labelledby="cities-title"
        >
          <div className="about-section-head">
            <p className="eyebrow">{t('about.citiesLabel')}</p>
            <h2 id="cities-title">{t('home.citiesTitle')}</h2>
            <p className="intro-text">{t('about.cordobaText')}</p>
          </div>
          <div className="city-pair">
            <article className="city-card">
              <div className="city-media">
                <Photo fallback="castleSea" decorative />
              </div>
              <p className="city-country">{t('home.lebanon')}</p>
              <h3>{t('home.saida')}</h3>
            </article>
            <div className="city-thread" aria-hidden>
              <ThreadMark />
              <span>{numberLabel(YEAR, l, { useGrouping: false })}</span>
            </div>
            <article className="city-card">
              <div className="city-media">
                <Photo fallback="cordoba" decorative />
              </div>
              <p className="city-country">{t('home.spain')}</p>
              <h3>{t('home.cordoba')}</h3>
            </article>
          </div>
        </section>

        <section
          className="section about-partners"
          aria-labelledby="partners-title"
        >
          <div className="about-section-head">
            <h2 id="partners-title" className="eyebrow">
              {t('about.partnersLabel')}
            </h2>
          </div>
          <ul className="partner-logos">
            <li>
              <img
                src="/brand/ufm-logo.svg"
                width={232}
                height={54}
                alt={t('home.ufm')}
                className="partner-logo"
              />
            </li>
            <li>
              <img
                src="/brand/alf-logo.png"
                width={1024}
                height={370}
                alt={t('home.alf')}
                className="partner-logo"
              />
            </li>
            <li>
              <a
                href="https://diverseworld.co"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/brand/diverse-world.svg"
                  width={1835}
                  height={486}
                  alt="Diverse World"
                  className="partner-logo partner-logo-small"
                />
              </a>
            </li>
            <li>
              <img
                src="/brand/saida-crest.png"
                width={120}
                height={120}
                alt={t('home.municipality')}
                className="partner-crest"
              />
            </li>
            <li className="partner-stage-city">
              <span>{t('home.saida')}</span>
              <small>{t('home.lebanon')}</small>
            </li>
          </ul>
        </section>

        <section
          className="section about-credits"
          id="credits"
          aria-labelledby="credits-title"
        >
          <div className="about-section-head about-credits-head">
            <div>
              <h2 id="credits-title">{t('about.creditsTitle')}</h2>
              <p className="muted">{t('about.creditsText')}</p>
            </div>
            <span className="credits-count">
              {t('about.creditsCount', {
                count: photoKeys.length,
                n: numberLabel(photoKeys.length, l),
              })}
            </span>
          </div>
          <ul className="credit-grid">
            {photoKeys.map((key) => (
              <li key={key} className="credit-item">
                <div className="credit-thumb">
                  <Photo fallback={key} decorative />
                </div>
                <div>
                  <p>{t('photos.' + key)}</p>
                  <PhotoCredit photo={key} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <OrganiserCTA />
    </MotionConfig>
  );
}
export function LegalPage({ kind }: { kind: 'privacy' | 'accessibility' }) {
  const t = useTranslations();
  return (
    <div className="container">
      <article className="article">
        <PageIntro
          eyebrow={t(
            kind === 'privacy' ? 'legal.privacyIntro' : 'legal.accessIntro',
          )}
          title={t(
            kind === 'privacy' ? 'legal.privacyTitle' : 'legal.accessTitle',
          )}
        />
        <div className="prose">
          {[1, 2, 3, 4].map((n) => (
            <section key={n}>
              {kind === 'privacy' && (
                <h2>{t('legal.privacy' + n + 'Title')}</h2>
              )}
              <p>
                {t('legal.' + (kind === 'privacy' ? 'privacy' : 'access') + n)}
              </p>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
export function NotFoundPage() {
  const t = useTranslations();
  const l = useLocale();
  return (
    <div className="page-bottom container">
      <PageIntro
        eyebrow={t('errors.notFoundLabel')}
        title={t('errors.notFoundTitle')}
      >
        {t('errors.notFoundText')}
      </PageIntro>
      <ButtonLink href={'/' + l}>{t('common.home')}</ButtonLink>
    </div>
  );
}
