import { test, expect } from '@playwright/test';
const routes = [
  '',
  'events',
  'events/an-evening-by-the-sea',
  'submit',
  'news',
  'news/a-year-of-culture-woven-together',
  'about',
  'contact',
  'admin',
  'privacy',
  'accessibility',
  'missing-page',
];
for (const locale of ['en', 'ar']) {
  for (const width of [360, 768, 1280, 1440]) {
    for (const route of routes) {
      test(locale + ' ' + width + ' ' + (route || 'home'), async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/' + locale + '/' + route);
        await page.locator('html[data-ready="true"]').waitFor();
        await page.evaluate(() => document.fonts.ready);
        // data-ready comes from the layout; pages behind loading.tsx hydrate later.
        // Let them finish before touching their images, or React reports a mismatch.
        await page.waitForLoadState('networkidle');
        // Full-page captures include below-the-fold photos, so load them all first.
        await page.evaluate(async () => {
          document
            .querySelectorAll<HTMLImageElement>('img[loading="lazy"]')
            .forEach((img) => (img.loading = 'eager'));
          await Promise.all(
            [...document.images].map((img) => img.decode().catch(() => {})),
          );
        });
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        ).toBe(true);
        await expect(page).toHaveScreenshot(
          locale +
            '-' +
            width +
            '-' +
            (route.replaceAll('/', '-') || 'home') +
            '.png',
          { fullPage: true, mask: [page.locator('nextjs-portal')] },
        );
      });
    }
  }
}
