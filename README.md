# MCCD Saida 2027 — Threads of the Sea

A complete English/Arabic front-end preview for Saida's Mediterranean Capital of Culture and Dialogue programme. It includes the public programme, organiser booking journey and a local mock administration workspace.

**This is a preview:** events, news and bookings are samples. Reservations and edits persist only in the current browser. No authentication, database, uploads or email sending are implemented. The supplied municipality crest is preserved. Photography slots use openly licensed Wikimedia Commons photographs of Saida (registry and credits in `src/lib/photos.ts`, credited on the About page) until approved programme photography is supplied.

## Run locally

Use Node.js 22.18+ (verified with 24.18) and npm.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

On PowerShell, use `Copy-Item .env.example .env.local`. Open [English](http://127.0.0.1:3000/en) or [Arabic](http://127.0.0.1:3000/ar).

```sh
npm run build
npm start
npm run storybook
npm run build-storybook
```

Storybook opens at port 6006. Its locale toolbar switches every story between LTR and RTL. It includes primitive states, calendars, maps, overlays and interactive page compositions. Workshop Server Actions use the same schemas locally; they never send or persist remotely.

## Configuration

| Variable                   | Purpose                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`     | Canonical origin for metadata. Set to the real HTTPS deployment origin.               |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Public Mapbox browser token. Leave empty for the designed venue placeholder.          |
| `NEXT_PUBLIC_MAPBOX_STYLE` | Published custom Studio style URL. Defaults to the supplied `/maps/saida-style.json`. |
| `NEXT_PUBLIC_BOOKING_MODE` | `time-slots` (default) or `whole-day`.                                                |
| `NEXT_PUBLIC_AXE`          | Set `true` for axe warnings in development. Automated tests run axe independently.    |

Public environment variables are bundled at build time. Restart development or rebuild after changing them.

The custom map style in `public/maps/saida-style.json` uses the project's paper, sea and rust palette and can be imported into Mapbox Studio. Publish it there and supply its style URL for account-managed styling. A valid token/style was not supplied, so live tiles were not validated; the no-token and failed-map states are implemented. Venue pins are approximate and require confirmation.

## Booking rules and demo states

`src/lib/config.ts` exposes the typed `BOOKING_MODE` flag. In time-slot mode the sample windows are morning 09:00–12:00, afternoon 14:00–17:00 and evening 18:00–21:00. Whole-day mode hides slot selection and reserves 09:00–21:00. These hours are provisional. All dates use **Asia/Beirut**, including daylight-saving conversion.

At Sea Castle esplanade, **6 March 2027** is partly booked and **15 March 2027** is fully booked. Use **7 March** for a fresh booking. On the review step, “Preview a booking conflict” demonstrates a concurrent reservation, preserves the form and offers nearby alternatives. The calendar uses text and strike-through as well as colour.

Drafts autosave after 350 ms under `saida-2027-draft-v1`. Completed records and admin changes use `saida-2027-demo-v1`. “Clear draft” clears a draft; “Reset demo data” in Admin restores all fixtures. Consent must be reconfirmed after reload. Files are validated locally (JPEG/PNG/WebP/PDF, up to 5 MB); only their name is recorded, and the file must be reselected after reload.

Browser locks prevent competing tabs on this origin from taking the same mock slot where supported. Cross-device booking requires an atomic server transaction and database constraint in the future backend.

## Routes

Every route exists beneath both `/en` and `/ar`.

- Home; `/events` list/calendar and `/events/[slug]`.
- `/submit`: details, date/time, organiser, review, conflict and confirmation.
- `/news` and `/news/[slug]`; `/about`; `/contact`.
- `/admin`: reservations, event editing, news creation/editing/scheduling/deletion, CSV export.
- `/privacy`, `/accessibility`, translated not-found and recoverable-error screens.

The contact form validates and shows an explicit “not sent” result. Admin is deliberately unauthenticated and marked as a local preview. Scheduled news stores the intended publication date/status; actual timed publishing belongs to the future backend.

## Design system and translation

All colour, type, spacing, radius and motion tokens are in the CSS-first `@theme` block in `src/app/globals.css`. Semantic classes use those tokens; button, field and badge variants use `tailwind-variants`. React Aria is the sole UI primitive library, with thin Phosphor icons and reduced-motion-aware transitions.

The website uses self-hosted `next/font` Manrope, Cormorant Garamond and Noto Sans Arabic. The component workshop has licensed local font copies. Social images use Manrope/Tajawal because the current image renderer cannot parse all Noto Arabic font tables; explicit word layout preserves Arabic reading order. Font licenses are alongside the files.

Add or change UI/content strings in **both** `src/messages/en.json` and `src/messages/ar.json`. Keep identical key structures; the tests enforce parity. Use `useTranslations` in client components and `getTranslations` in server metadata. Arabic uses logical CSS properties, Gregorian dates, Arabic numerals and RTL layout. New sample content belongs in the message files, with typed records mapped in `src/lib/data/mock.ts`.

The React 19/Next.js View Transition integration is used for event row/title transitions. This installed stable Next.js release no longer needs the old experimental config flag. Browsers without support use normal navigation.

## Data boundary

`src/lib/data/types.ts` preserves the requested future `events`, `venues`, `reservations` and `news_posts` column shapes. Fixtures are in `mock.ts`; query/filter functions are in `index.ts`; availability and mock reservation mutations are in `booking.ts`; the public client projection is in `hooks.ts`.

The required functions are present: `getUpcomingEvents`, `getEvents`, `getEventBySlug`, `getAvailability`, `createReservation` and `getNews`. Replace these adapters when connecting the backend. Shared Zod schemas live in `src/lib/schemas/`; current Server Actions validate only.

Private email/phone fields belong to reservations and admin exports. Public event components, availability responses and calendar downloads omit them. All fixture contacts are fictitious. This browser-local demonstration is **not** a security boundary for real personal data.

Expected attendance, attachment filename and submission language are held in an explicit UI sidecar because the supplied future tables have no matching columns. CSV submission exports include those fields. A single-language submission is mirrored into both title/description columns in this preview; production needs an agreed translation workflow. Local edits appear immediately in this browser. Server-rendered metadata and social images use server fixtures, so local-only submissions cannot be shared across devices or crawled.

## Checks

```sh
npm run typecheck
npm run lint
npm run format
npm test
npm run test:visual
```

Playwright is configured for installed Microsoft Edge (`channel: 'msedge'`). Elsewhere, install Edge with `npx playwright install msedge`, or change the channel to an installed browser. The screenshot baselines were captured on Windows/Edge; font rasterisation can differ across platforms.

Tests cover both locales and twelve routes at **360, 768, 1280 and 1440 px**, with reduced motion and loaded fonts before capture. They also cover axe WCAG 2.1 AA checks, booking/conflict/draft flows, private-contact exclusion, admin mutation/export, contact validation, timezone offsets, both booking modes and translation-key parity.

To intentionally regenerate baselines after reviewing a design change:

```sh
npm run test:visual -- --update-snapshots
```

See `QA.md` for measured results and scope.

TypeScript 7 is used for the strict command-line check. The official side-by-side TypeScript 6 API alias is retained for tools that still require the JavaScript compiler API (Next/Storybook/ESLint). The repository's `.npmrc` avoids unrelated optional resolver peer conflicts; all required runtime peers are explicitly installed and locked.

## Vercel handoff

The new Vercel project is `khalid-services/mccd-saida-2027`. The checked-in `vercel.json` explicitly selects Next.js (so Storybook's Vite dependency cannot change framework detection), uses `npm ci` and `npm run build`, and keeps the framework's default output directory. Configure the variables above before official launch. The site currently emits `noindex`; remove that preview setting in the locale layout only when approved for public launch.

The preview URL and deployment verification are recorded in `DEPLOYMENT.md`. Future previews can be published with `vercel deploy --target preview`. Production promotion and a custom domain remain the account owner's launch decision. No credentials or local environment files are included in the repository archive.

See [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) for the short client decision list.
