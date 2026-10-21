import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for (const locale of ['en', 'ar']) {
  for (const route of [
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
  ]) {
    test('accessibility ' + locale + '/' + route, async ({ page }) => {
      await page.goto('/' + locale + '/' + route);
      await page.evaluate(() => document.fonts.ready);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}
