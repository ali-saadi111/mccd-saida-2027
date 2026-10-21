# Verification record

Verified on 19 October 2026 with Node 24.18, Microsoft Edge on Windows, Next 16.4.2 and React 19.3.1.

## Results

| Check                           | Result                                                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Playwright regression suite     | **136 passed**, 0 failed, 0 skipped, 0 flaky                                                               |
| Page screenshot comparisons     | **96 passed**: 12 routes × 2 languages × 4 widths                                                          |
| Additional booking screenshots  | Date selection and conflict dialog in both languages                                                       |
| Route accessibility scans       | 24 routes passed axe WCAG 2.1 A/AA rules                                                                   |
| Interactive accessibility scans | Booking steps, confirmation, conflict, mobile menu, date popover and admin dialog passed in both languages |
| Calendar touch targets          | Booking calendar and date-picker popup at least 44 px wide at a 360 px viewport                            |
| TypeScript strict check         | Passed with TypeScript 7                                                                                   |
| ESLint                          | Passed                                                                                                     |
| Next production build           | Passed                                                                                                     |
| Storybook static build          | Passed; interactive screen stories also opened in a browser                                                |
| Lighthouse, English home        | **100 Accessibility / 100 Best Practices**                                                                 |
| Lighthouse, Arabic home         | **100 Accessibility / 100 Best Practices**                                                                 |
| Production dependency audit     | **0 reported vulnerabilities**                                                                             |

Lighthouse used the local production server with the mobile preset and no Mapbox token. Scores are measured results for those two pages, not a certification of every possible interaction or a promise about a future deployment.

## Covered behaviour

- Search/filter composition, empty-state recovery, month navigation and language switching.
- Time-slot and whole-day availability rules, cancellation, nearby alternatives and blocked bookings.
- Required-field validation, draft restore/clear, conflict recovery and successful reservations.
- Private contact exclusion from public pages and calendar exports.
- News draft creation/deletion, reservation cancellation and CSV downloads.
- Contact validation and explicit no-email-sent confirmation.
- Correct Beirut daylight-saving offsets and sample weekdays; UTF-8-safe calendar-file folding; CSV formula neutralisation.
- Matching translation keys and public data shapes.
- No page-level horizontal overflow at 360, 768, 1280 or 1440 px.

Screenshots are checked in under `tests/*-snapshots/`. They use Windows/Edge font rendering; another operating system may need reviewed baselines.

## Scope and remaining integration

This is a local-data front end. Real multi-user booking integrity, authentication/permissions, database persistence, uploads, scheduled publishing and sending email require the later backend. Browser-local records are unavailable to social crawlers. Live Mapbox tiles and a hosted Studio style still require the client's token/account.

An independent assistive-technology and editorial review is appropriate before the official launch. Automated checks do not prove complete WCAG conformance. Venue accessibility information, Arabic/English editorial approval and official partner assets remain client decisions.

## Development dependency advisory

The full audit reports five package entries for one underlying `braces` denial-of-service advisory in the Next ESLint dependency chain. The upstream advisory lists no patched version as of this check. It concerns deeply nested input glob patterns; this project's lint configuration uses fixed local paths. These packages are development tooling, and `npm audit --omit=dev` reports zero vulnerabilities. Keep monitoring the upstream fix; do not apply the audit tool's suggested downgrade to Next 14. [Upstream advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
