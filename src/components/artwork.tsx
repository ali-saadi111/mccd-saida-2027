import { useId } from 'react';
import { useTranslations } from 'next-intl';
import { photos, type PhotoKey } from '@/lib/photos';
/**
 * Supplied photography; otherwise the `fallback` stock photograph of Saida;
 * otherwise the line illustration.
 */
export function Photo({
  src,
  alt = '',
  fallback,
  variant,
  eager = false,
  decorative = false,
  className = '',
}: {
  src?: string | null;
  alt?: string;
  fallback?: PhotoKey;
  variant?: 'sea' | 'arch' | 'threads';
  eager?: boolean;
  /** Empty alt when an adjacent title already describes the image. */
  decorative?: boolean;
  className?: string;
}) {
  const t = useTranslations('photos');
  const stock = !src && fallback ? photos[fallback] : null;
  if (!src && !stock) return <SeaArtwork variant={variant} />;
  return (
    <img
      src={src || stock!.src}
      alt={decorative ? '' : src ? alt : t(fallback!)}
      width={stock?.width}
      height={stock?.height}
      className={'photo ' + className}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      decoding="async"
    />
  );
}
export function PhotoCredit({
  photo,
  className = 'photo-credit',
}: {
  photo: PhotoKey;
  className?: string;
}) {
  const t = useTranslations('site');
  const p = photos[photo];
  return (
    <a
      href={p.source}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {t('photoCredit', { author: p.author, license: p.license })}
    </a>
  );
}
export function SeaArtwork({
  variant = 'sea',
  className = '',
}: {
  variant?: 'sea' | 'arch' | 'threads';
  className?: string;
}) {
  const id = useId().replaceAll(':', '');
  return (
    <svg
      className={'sea-art ' + className}
      viewBox="0 0 600 680"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={id}>
          <rect width="600" height="680" />
        </clipPath>
      </defs>
      <g clipPath={'url(#' + id + ')'}>
        <rect width="600" height="680" className="art-paper" />
        <circle cx="350" cy="216" r="132" className="art-sun" />
        {variant === 'arch' ? (
          <>
            <path
              d="M110 560V280C110 80 490 80 490 280V560"
              className="art-arch"
            />
            <path
              d="M180 560V290C180 155 420 155 420 290V560"
              className="art-arch-inner"
            />
            <path
              d="M249 570V324C249 254 351 254 351 324V570"
              className="art-arch-inner"
            />
          </>
        ) : (
          <g className="art-castle">
            <path d="M70 390V285H95V266H120V285H145V266H170V285H195V390Z" />
            <path d="M195 390V332L255 313L300 335V390Z" />
            <path d="M300 390V307H326V280H400V307H485V390Z" />
            <path d="M338 280C338 240 388 240 388 280" />
            <path d="M125 390V348C125 323 155 323 155 348V390M355 342V369M410 332V356" />
          </g>
        )}
        {Array.from({ length: 18 }, (_, i) => (
          <path
            key={i}
            d={
              'M-70 ' +
              (418 + i * 15) +
              ' C80 ' +
              (330 + i * 15) +
              ' 195 ' +
              (525 + i * 10) +
              ' 340 ' +
              (425 + i * 14) +
              ' S555 ' +
              (360 + i * 14) +
              ' 675 ' +
              (440 + i * 14)
            }
            className={i % 5 === 0 ? 'art-thread-accent' : 'art-thread'}
          />
        ))}
        <path d="M397 368C350 460 250 491 205 680" className="art-path" />
        <path
          d="M60 67H115M60 67V122M540 612H485M540 612V557"
          className="art-registration"
        />
        <circle cx="60" cy="612" r="5" className="art-dot" />
        <circle cx="540" cy="67" r="5" className="art-dot" />
      </g>
    </svg>
  );
}
export function ThreadMark() {
  return (
    <svg
      viewBox="0 0 100 64"
      fill="none"
      aria-hidden="true"
      className="thread-mark"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={
            'M0 ' +
            (20 + i * 6) +
            ' C25 ' +
            (-8 + i * 6) +
            ' 52 ' +
            (60 + i * 6) +
            ' 100 ' +
            (12 + i * 6)
          }
        />
      ))}
    </svg>
  );
}
