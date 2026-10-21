'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AppLink, Button } from './ui';
import { notify } from './providers';
export function ShareLinks({
  title,
  label,
}: {
  title: string;
  /** Translated heading; defaults to the event wording. */
  label?: string;
}) {
  const t = useTranslations();
  const [url, setUrl] = useState('');
  useEffect(() => setUrl(window.location.href), []);
  const sharing = [
    [
      'whatsapp',
      'https://wa.me/?text=' + encodeURIComponent(title + ' ' + url),
    ],
    [
      'facebook',
      'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url),
    ],
    [
      'x',
      'https://twitter.com/intent/tweet?text=' +
        encodeURIComponent(title) +
        '&url=' +
        encodeURIComponent(url),
    ],
  ];
  return (
    <>
      <p className="eyebrow mt-10">{label ?? t('common.share')}</p>
      <div className="share-links">
        <Button
          variant="secondary"
          size="sm"
          onPress={async () => {
            try {
              await navigator.clipboard.writeText(url);
              notify(t('common.copied'));
            } catch {
              notify(t('common.copyFailed'));
            }
          }}
        >
          {t('common.copy')}
        </Button>
        {sharing.map(([key, href]) => (
          <AppLink
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('common.' + key)}
          </AppLink>
        ))}
      </div>
    </>
  );
}
