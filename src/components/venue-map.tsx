'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { MapPin } from '@phosphor-icons/react';
import { AppLink, Arrow } from './ui';
import { localised, type Venue } from '@/lib/data/types';
import 'mapbox-gl/dist/mapbox-gl.css';
export function VenueMap({ venue }: { venue: Venue }) {
  const t = useTranslations();
  const l = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const style =
    process.env.NEXT_PUBLIC_MAPBOX_STYLE || '/maps/saida-style.json';
  useEffect(() => {
    if (!token || !style || !ref.current) return;
    let map: import('mapbox-gl').Map | undefined;
    let disposed = false;
    import('mapbox-gl')
      .then(({ default: mapbox }) => {
        if (disposed || !ref.current) return;
        try {
          map = new mapbox.Map({
            container: ref.current,
            accessToken: token,
            style,
            center: [venue.lng, venue.lat],
            zoom: 14,
            attributionControl: true,
          });
          map.on('error', () => setFailed(true));
          new mapbox.Marker({
            color: getComputedStyle(document.documentElement)
              .getPropertyValue('--color-rust')
              .trim(),
          })
            .setLngLat([venue.lng, venue.lat])
            .addTo(map);
          map.addControl(new mapbox.NavigationControl({ showCompass: false }));
        } catch {
          setFailed(true);
        }
      })
      .catch(() => setFailed(true));
    return () => {
      disposed = true;
      map?.remove();
    };
  }, [token, style, venue]);
  return (
    <section aria-label={localised(venue, 'name', l)}>
      {token && style && !failed ? (
        <div
          ref={ref}
          className="live-map"
          aria-label={t('events.mapPlaceholder')}
        />
      ) : (
        <div className="map-placeholder">
          <MapPin weight="thin" aria-hidden />
          <p>{localised(venue, 'name', l)}</p>
          <p>{failed ? t('events.mapError') : t('events.mapHelp')}</p>
        </div>
      )}
      <AppLink
        href={
          'https://www.google.com/maps/dir/?api=1&destination=' +
          venue.lat +
          ',' +
          venue.lng
        }
        target="_blank"
        rel="noopener noreferrer"
      >
        {t('common.directions')}
        <Arrow diagonal />
      </AppLink>
    </section>
  );
}
