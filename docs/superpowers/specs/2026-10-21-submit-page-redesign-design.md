# Submit an event — redesign ("Guided journey")

Date: 2026-10-21 · Status: approved by user

## Goal

Make `/[locale]/submit` feel more inviting and shorter to complete: richer visual identity
(photography, live event-card preview) and a restructured flow that splits the overlong first step.

## Non-goals (must not change)

- `submissionSchema`, `defaultSubmission`, validation message keys.
- Draft autosave/restore (`DRAFT_KEY`, localStorage), availability (`getAvailability`),
  `createReservation`, `validateSubmissionAction`, conflict dialog + alternatives, `BOOKING_MODE`
  whole-day behaviour, file validation rules (JPG/PNG/WebP/PDF ≤ 5 MB, preview only).
- EN/AR parity, RTL, focus moved to the step heading on step change, `shouldFocus` on invalid fields,
  44px touch targets, no horizontal scroll at 360px.

## Layout

1. **Banner header** (`.submit-hero`): rounded photo band (photo `khan`, decorative) with the
   existing hero shade gradient, eyebrow / h1 / intro unchanged in copy, plus a meta line
   `booking.meta` ("About 5 minutes · Your draft saves automatically"). Height ≈ 40% of home hero.
2. **Progress rail** (`.journey-steps`, an `<ol>`): 5 steps, number or check, label. Completed steps
   are buttons that jump back; current has `aria-current="step"`; future steps are inert text.
3. **Two columns** (`.form-layout`): form panel + sticky **live preview** aside. ≤1100px the
   aside becomes a compact bar above the form (title · venue · date) that toggles the full card
   (`aria-expanded`).

## Steps

| # | key | Title key | Fields (validated on Next) |
|---|---|---|---|
| 1 | `idea` | `booking.ideaTitle` | title, description, category, file upload |
| 2 | `audience` | `booking.audienceTitle` | audience, language, attendance, entry, accessibility, website |
| 3 | `date` | `booking.dateTitle` | venue_id, date, slot |
| 4 | `organiser` | `booking.organiserTitle` | name, organisation, email, phone |
| 5 | `review` | `booking.reviewTitle` | consent (+ demo simulate toggle) |

## Controls

- **Category**: `ChipGroup` single-select; pressing the selected chip does not clear it.
- **Audience / Language**: `ChipGroup` multiple; errors shown below as today.
- **Entry**: `ChipGroup` single-select (free / ticketed), not clearable.
- **Venue**: React Aria `RadioGroup` of photo cards (`.venue-card`: 4:3 photo from `venuePhoto`,
  venue name, checkmark when selected). Changing venue clears the date (as today).
- **Upload**: larger drop zone; selected image files show a thumbnail (object URL, revoked on change/
  unmount); PDFs show the filename.
- Calendar + slot radios unchanged.

## Live preview (`.journey-preview`)

Uses `.event-card` markup/styling (non-link): media = uploaded image if image, else venue photo;
date badge (day / short month, or "—"); meta = category · entry; title or `booking.untitled`;
place line = weekday · venue, or `booking.pickDate`. Below: draft status + Clear draft.

## Review step

Grouped summary blocks (Idea, Who it's for, Place & time, About you), each with an "Edit" button
(`booking.edit`) that jumps to that step. Then consent, privacy link, demo notice, simulate toggle.

## Success screen

Same copy/actions; adds the preview card (with reference) beside the text on wide screens.

## i18n

New keys in `en.json` and `ar.json`: `booking.steps.{idea,audience,date,organiser,review}`,
`ideaTitle`, `audienceTitle`, `meta`, `edit`, `pickDate`, `preview`, `showPreview`,
`groups.{idea,audience,date,organiser}`. Obsolete keys (`steps.details`, `detailsTitle`) removed.

## Testing

- Update `tests/flows.spec.ts` and `tests/states.spec.ts` for the extra "Next step" between idea
  and date steps (heading-based assertions stay).
- Run: typecheck, lint, Playwright flows/states/accessibility. Visual baselines for `submit` and
  booking screenshots will change and need `--update-snapshots`.
- Manual check in browser: EN + AR, 1440 and 360 widths.
