import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import en from '@/messages/en.json';
import ar from '@/messages/ar.json';
/** OG uses the same palette as globals.css. Inline styles are required by next/og. */
export async function createSocialImage({
  title,
  detail,
  locale,
}: {
  title: string;
  detail: string;
  locale: string;
}) {
  const messages = locale === 'ar' ? ar : en;
  const rtl = locale === 'ar';
  // Satori shapes Arabic glyphs but does not reorder multi-word RTL runs.
  // Explicit word boxes retain correct reading order and wrapping.
  const text = (value: string, gap = 8) =>
    rtl ? (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row-reverse',
          flexWrap: 'wrap',
          gap,
        }}
      >
        {value.split(/\s+/).map((word, index) => (
          <span key={index}>{word}</span>
        ))}
      </div>
    ) : (
      value
    );
  const [font, crest] = await Promise.all([
    readFile(
      path.join(
        process.cwd(),
        'public/fonts/' + (locale === 'ar' ? 'Tajawal' : 'Manrope') + '.ttf',
      ),
    ),
    readFile(path.join(process.cwd(), 'public/brand/saida-crest.png')),
  ]);
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 64,
        background: '#f7f5ef',
        color: '#173c43',
        fontFamily: 'Brand',
        direction: locale === 'ar' ? 'rtl' : 'ltr',
        borderBottom: '16px solid #245a63',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: rtl ? 'row-reverse' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: rtl ? 'row-reverse' : 'row',
            alignItems: 'center',
            gap: 24,
          }}
        >
          <img
            src={'data:image/png;base64,' + crest.toString('base64')}
            alt=""
            width={80}
            height={80}
          />
          <div style={{ display: 'flex', fontSize: 26 }}>
            {text(messages.site.name)}
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 20, color: '#6b2d5c' }}>
          {text(messages.site.sampleShort)}
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: rtl ? 'flex-end' : 'flex-start',
          fontSize: rtl ? 58 : 68,
          lineHeight: 1.2,
        }}
      >
        {text(title, 16)}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: rtl ? 'row-reverse' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #cbd0c9',
          paddingTop: 24,
        }}
      >
        <div style={{ display: 'flex', fontSize: 25 }}>{text(detail)}</div>
        <div style={{ display: 'flex', fontSize: 25, color: '#6b2d5c' }}>
          {text(messages.about.themeTitle)}
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [{ name: 'Brand', data: font, weight: 400, style: 'normal' }],
    },
  );
}
