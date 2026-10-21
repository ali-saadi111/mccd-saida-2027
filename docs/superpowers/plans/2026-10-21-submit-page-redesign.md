# Submit page redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/[locale]/submit` as the 5-step "Guided journey" in `docs/superpowers/specs/2026-10-21-submit-page-redesign-design.md`.

**Architecture:** `BookingForm` keeps all state/logic (react-hook-form, drafts, availability, reservation). Presentation pieces move to two focused files: `booking-preview.tsx` (live event card + mobile bar) and `booking-parts.tsx` (progress rail, venue picker, upload zone, review groups). Styles live in a new `/* Submit journey */` block in `globals.css`, replacing the old `.steps` / `.booking-summary` rules.

**Tech Stack:** Next 16, React 19, react-hook-form + zod, react-aria-components, motion, next-intl, Playwright.

Note: the project is not a git repository, so commit steps are skipped.

---

## File map

| File | Responsibility |
|---|---|
| `src/components/booking-form.tsx` (modify) | State, validation, step routing, step bodies, success + dialogs |
| `src/components/booking-parts.tsx` (create) | `JourneySteps`, `VenuePicker`, `UploadZone`, `ReviewGroups` |
| `src/components/booking-preview.tsx` (create) | `BookingPreview` (card + draft controls, collapsible on mobile) |
| `src/app/globals.css` (modify) | `.submit-hero`, `.journey-steps`, `.journey-preview`, `.venue-card`, `.upload-zone`, `.review-group`, responsive |
| `src/messages/en.json`, `ar.json` (modify) | New/renamed `booking.*` keys |
| `tests/flows.spec.ts`, `tests/states.spec.ts` (modify) | Extra "Next step" between idea and date |

### Task 1: Messages
- [ ] Add keys listed in spec §i18n to `en.json` and `ar.json`; remove `steps.details`, `detailsTitle`.
- [ ] Verify: `node -e` key-parity check between en/ar `booking` objects prints no diff.

### Task 2: Tests first (they define the new flow)
- [ ] In `flows.spec.ts` `details()` and `states.spec.ts`, after filling title/description click "Next step" once more (audience step, heading `booking.audienceTitle`) before asserting the date heading.
- [ ] Run `npx playwright test tests/flows.spec.ts -g autosave` against the old UI → expect the changed flow tests to FAIL (no audience heading).

### Task 3: `booking-parts.tsx`
- [ ] `JourneySteps({ steps, current, onJump })` — `<ol aria-label="Step x of y">`, completed items render `<button>` calling `onJump(i)`.
- [ ] `VenuePicker({ value, onChange, error })` — RadioGroup of `.venue-card` with `Photo fallback={venuePhoto[id]} decorative`.
- [ ] `UploadZone({ file, restored, error, onSelect, onRemove })` — FileTrigger, image thumbnail via object URL (revoked in effect cleanup).
- [ ] `ReviewGroups({ values, onEdit })` — 4 groups of `summary-line` rows + "Edit" button per group.

### Task 4: `booking-preview.tsx`
- [ ] `BookingPreview({ values, imageUrl, draftFailed, onClear })` — `.event-card` markup (title as `<h3>` text, not link), mobile toggle button with `aria-expanded`.

### Task 5: `booking-form.tsx`
- [ ] `steps = ['idea','audience','date','organiser','review']`, new `stepFields`.
- [ ] Banner header replaces `PageIntro`; `JourneySteps` replaces `.steps`; step bodies use ChipGroup / VenuePicker / UploadZone; review uses `ReviewGroups`; aside uses `BookingPreview`.
- [ ] Submit on step index 4; conflict "choose different date" jumps to step 2 (date).
- [ ] Success page shows `BookingPreview`-style card.

### Task 6: CSS
- [ ] Add journey block; delete superseded `.steps*`, `.booking-summary*` rules and their responsive overrides.

### Task 7: Verify
- [ ] `npm run typecheck` and `npm run lint` → clean.
- [ ] `npx playwright test tests/flows.spec.ts tests/states.spec.ts tests/accessibility.spec.ts --update-snapshots` → pass.
- [ ] Browser check EN/AR at 1440 and 360.
