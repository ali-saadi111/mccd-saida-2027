'use client';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { List, X, GlobeHemisphereWest } from '@phosphor-icons/react';
import { ModalOverlay, Modal, Dialog, Heading } from 'react-aria-components';
import { AppLink, Button, ButtonLink } from './ui';
import { CONTACT_EMAIL } from '@/lib/config';
export function Brand({ crest = true }: { crest?: boolean }) {
  const t = useTranslations();
  const l = useLocale();
  return (
    <AppLink href={'/' + l} className="brand">
      {crest && (
        <img
          src="/brand/saida-crest.png"
          alt={t('site.crest')}
          width={52}
          height={62}
        />
      )}
      <span>
        <strong>{t('site.short')}</strong>
        <small>{t('site.tagline')}</small>
      </span>
    </AppLink>
  );
}
export function LanguageSwitch({ className = 'language-switch' }) {
  const l = useLocale();
  const t = useTranslations();
  const path = usePathname();
  return (
    <AppLink
      href={path.replace(/^\/(en|ar)/, l === 'en' ? '/ar' : '/en')}
      hrefLang={l === 'en' ? 'ar' : 'en'}
      lang={l === 'en' ? 'ar' : 'en'}
      className={className}
    >
      <GlobeHemisphereWest weight="regular" aria-hidden />
      {t('nav.language')}
    </AppLink>
  );
}
/** Standalone 3D crest beside the tagline; the wordmark stays for screen readers. */
function CrestMark() {
  const t = useTranslations();
  const l = useLocale();
  return (
    <AppLink href={'/' + l} className="crest-mark">
      <img
        src="/brand/saida-crest-cutout.png"
        alt={t('site.crest')}
        width={469}
        height={516}
      />
      <span className="crest-tagline">{t('site.tagline')}</span>
      <span className="sr-only">{t('site.short')}</span>
    </AppLink>
  );
}
/** Floating header, adapted from 21st.dev "Floating Header" (efferd). */
export function Header() {
  const t = useTranslations();
  const l = useLocale();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const links = [
    ['events', 'programme'],
    ['news', 'news'],
    ['about', 'about'],
    ['contact', 'contact'],
  ];
  const nav = (
    <>
      {links.map(([url, key]) => (
        <AppLink
          key={url}
          href={'/' + l + '/' + url}
          aria-current={
            path.startsWith('/' + l + '/' + url) ? 'page' : undefined
          }
          onPress={() => setOpen(false)}
          className="nav-link"
        >
          {t('nav.' + key)}
        </AppLink>
      ))}
    </>
  );
  return (
    <>
      <AppLink href="#main" className="skip-link">
        {t('nav.skip')}
      </AppLink>
      <header className="site-header" data-scrolled={scrolled || undefined}>
        <div className="container">
          <div className="header-inner">
            <CrestMark />
            <nav className="desktop-nav" aria-label={t('nav.menu')}>
              {nav}
            </nav>
            <div className="header-actions">
              <LanguageSwitch className="language-switch header-language" />
              <ButtonLink
                href={'/' + l + '/submit'}
                size="sm"
                className="header-submit"
              >
                {t('nav.submit')}
              </ButtonLink>
              <Button
                variant="outline"
                size="icon"
                className="mobile-toggle"
                aria-label={t('nav.menu')}
                onPress={() => setOpen(true)}
              >
                <List weight="regular" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      <ModalOverlay
        isOpen={open}
        onOpenChange={setOpen}
        isDismissable
        className="modal-overlay mobile-nav-overlay"
      >
        <Modal className="mobile-nav">
          <Dialog className="dialog">
            <div className="flex items-center justify-between">
              <Heading slot="title" className="eyebrow">
                {t('site.name')}
              </Heading>
              <Button
                variant="outline"
                size="icon"
                aria-label={t('nav.close')}
                onPress={() => setOpen(false)}
              >
                <X weight="regular" />
              </Button>
            </div>
            <nav>{nav}</nav>
            <div className="mobile-nav-footer">
              <ButtonLink
                href={'/' + l + '/submit'}
                onPress={() => setOpen(false)}
              >
                {t('nav.submit')}
              </ButtonLink>
              <LanguageSwitch />
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </>
  );
}
/** Site footer, adapted from 21st.dev "Footer 01" (balick). */
export function Footer() {
  const t = useTranslations();
  const l = useLocale();
  const columns: [string, [string, string][]][] = [
    [
      t('footer.explore'),
      [
        ['events', t('nav.programme')],
        ['submit', t('nav.submit')],
        ['news', t('nav.news')],
      ],
    ],
    [
      t('footer.initiative'),
      [
        ['about', t('nav.about')],
        ['contact', t('nav.contact')],
      ],
    ],
    [
      t('footer.website'),
      [
        ['privacy', t('nav.privacy')],
        ['admin', t('nav.admin')],
      ],
    ],
  ];
  return (
    <footer className="site-footer">
      <div className="footer-top container">
        <div className="footer-brand">
          <Brand />
          <p className="footer-description">{t('home.footerText')}</p>
          <div>
            <p className="footer-heading">{t('home.coordinated')}</p>
            <ul className="footer-logos">
              <li>
                <img
                  src="/brand/ufm-logo.svg"
                  width={232}
                  height={54}
                  alt={t('home.ufm')}
                />
              </li>
              <li>
                <img
                  src="/brand/alf-logo.png"
                  width={1024}
                  height={370}
                  alt={t('home.alf')}
                />
              </li>
            </ul>
          </div>
        </div>
        <nav aria-label={t('nav.menu')} className="footer-columns">
          {columns.map(([title, links]) => (
            <div key={title}>
              <p className="footer-heading">{title}</p>
              <ul>
                {links.map(([href, label]) => (
                  <li key={href}>
                    <AppLink
                      href={'/' + l + '/' + href}
                      className="footer-link"
                    >
                      {label}
                    </AppLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="container">
        <div className="footer-bottom">
          <div>
            <span>{t('home.copyright')}</span>
            <span>
              {t('home.municipality')} ·{' '}
              <a href={'mailto:' + CONTACT_EMAIL} dir="ltr">
                {CONTACT_EMAIL}
              </a>
            </span>
          </div>
          <div className="footer-end">
            <LanguageSwitch className="language-switch footer-language" />
            <span className="footer-maker">
              {t.rich('home.madeBy', {
                link: (chunks) => (
                  <a
                    href="https://diverseworld.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    dir="ltr"
                  >
                    {chunks}
                  </a>
                ),
              })}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
