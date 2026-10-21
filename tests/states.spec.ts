import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import en from '../src/messages/en.json';
import ar from '../src/messages/ar.json';
async function accessible(page: Page) {
  // Let the 200 ms overlay/step exit complete before auditing the settled tree.
  await page.waitForTimeout(250);
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.html),
    })),
  ).toEqual([]);
}
for (const locale of ['en', 'ar'] as const) {
  const m = locale === 'ar' ? ar : en;
  test(
    locale + ' booking states, keyboard controls and mobile calendar targets',
    async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/' + locale + '/submit');
      await page
        .getByLabel(m.booking.titleField, { exact: false })
        .fill(
          locale === 'ar'
            ? 'لقاء ثقافي في المدينة'
            : 'A shared courtyard gathering',
        );
      await page
        .getByLabel(m.booking.description, { exact: false })
        .fill(
          locale === 'ar'
            ? 'لقاء ثقافي تجريبي مع الموسيقى والحكايات والأنشطة لجميع الأعمار.'
            : 'A community gathering with storytelling, music and activities for all ages.',
        );
      await page
        .getByRole('button', { name: m.booking.next, exact: true })
        .click();
      await expect(
        page.getByRole('heading', { name: m.booking.audienceTitle }),
      ).toBeVisible();
      await page
        .getByRole('button', { name: m.booking.next, exact: true })
        .click();
      await expect(
        page.getByRole('heading', { name: m.booking.dateTitle }),
      ).toBeVisible();
      await page
        .locator(
          '.calendar-cell[data-state="available"]:not([data-outside-month])',
        )
        .first()
        .click();
      expect(
        await page
          .locator('.calendar-cell:not([data-outside-month])')
          .first()
          .evaluate((el) => el.getBoundingClientRect().width),
      ).toBeGreaterThanOrEqual(44);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(360);
      await accessible(page);
      await expect(page).toHaveScreenshot(locale + '-booking-date.png', {
        fullPage: true,
        mask: [page.locator('nextjs-portal')],
      });
      await page
        .getByRole('button', { name: m.booking.next, exact: true })
        .click();
      await page
        .getByLabel(m.booking.name, { exact: false })
        .fill('Demo Organiser');
      await page
        .getByLabel(m.booking.organisation, { exact: false })
        .fill('Community Group');
      await page
        .getByLabel(m.booking.email, { exact: false })
        .fill('private@example.invalid');
      await page
        .getByLabel(m.booking.phone, { exact: false })
        .fill('+961 71 123456');
      await accessible(page);
      await page
        .getByRole('button', { name: m.booking.next, exact: true })
        .click();
      await page
        .getByRole('checkbox', { name: m.booking.consent, exact: true })
        .press('Space');
      await page
        .getByRole('checkbox', { name: m.booking.simulate, exact: true })
        .press('Space');
      await accessible(page);
      await page
        .getByRole('button', { name: m.booking.submit, exact: true })
        .click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await accessible(page);
      await expect(page).toHaveScreenshot(locale + '-booking-conflict.png', {
        fullPage: true,
        mask: [page.locator('nextjs-portal')],
      });
      await page
        .getByRole('button', { name: m.booking.chooseAlternative, exact: true })
        .first()
        .click();
      await page
        .getByRole('button', { name: m.booking.submit, exact: true })
        .click();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        m.booking.successTitle,
      );
      await accessible(page);
    },
  );
  test(
    locale + ' mobile navigation, date popover and admin modal accessibility',
    async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 900 });
      await page.goto('/' + locale + '/events');
      await page.locator('.mobile-toggle').click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await accessible(page);
      await page.keyboard.press('Escape');
      await page
        .getByRole('button', { name: new RegExp(m.events.date) })
        .click();
      await expect(page.getByRole('dialog')).toBeVisible();
      expect(
        await page
          .locator('.popover .calendar-cell')
          .first()
          .evaluate((el) => el.getBoundingClientRect().width),
      ).toBeGreaterThanOrEqual(44);
      await accessible(page);
      await page.keyboard.press('Escape');
      await page.goto('/' + locale + '/admin');
      await page
        .getByRole('button', { name: m.admin.editReservation, exact: true })
        .first()
        .click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await accessible(page);
    },
  );
}
