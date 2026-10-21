import { test, expect, type Page } from '@playwright/test';
async function details(page: Page) {
  await page.goto('/en/submit');
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await expect(
    page.getByText('Enter an event title of at least 5 characters.'),
  ).toBeVisible();
  await page
    .getByLabel('Event title', { exact: false })
    .fill('A shared courtyard gathering');
  await page
    .getByLabel('Short description', { exact: false })
    .fill(
      'A community gathering with storytelling, music and activities for neighbours of all ages.',
    );
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Who is it for?' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Find your place in the programme.' }),
  ).toBeVisible();
}
async function organiser(page: Page) {
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await page.getByLabel('Your name', { exact: false }).fill('Demo Organiser');
  await page
    .getByLabel('Organisation', { exact: false })
    .fill('Neighbourhood Culture');
  await page
    .getByLabel('Email address', { exact: false })
    .fill('private-test@example.invalid');
  await page
    .getByLabel('Phone number', { exact: false })
    .fill('+961 71 123456');
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'One last look.' }),
  ).toBeVisible();
  await page
    .getByRole('checkbox', { name: /I agree to the event/ })
    .press('Space');
}
test('programme filters, empty recovery, calendar navigation and language switch', async ({
  page,
}) => {
  await page.goto('/en/events');
  await page.getByLabel('Search the programme').fill('no such programme event');
  await expect(
    page.getByRole('heading', { name: 'A little quieter here.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).first().click();
  await expect(
    page
      .getByRole('link', { name: 'An evening by the sea', exact: true })
      .first(),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Calendar', exact: true }).click();
  await page.getByRole('button', { name: 'Next month', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'April 2027', exact: true }).first(),
  ).toBeVisible();
  await page
    .getByRole('link', { name: 'العربية', exact: true })
    .first()
    .click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('اكتشف');
});
test('draft restores, full days and booked slots are unavailable, reservation is published only after approval and without private contacts', async ({
  page,
}) => {
  await details(page);
  await page.getByRole('button', { name: /\b6 March 2027\b/ }).click();
  await expect(page.getByRole('radio', { name: /Evening/ })).toBeDisabled();
  await expect(page.locator('.calendar-cell[data-unavailable]')).toHaveCount(1);
  await page.getByRole('radio', { name: /Morning/ }).check();
  await organiser(page);
  await page
    .getByRole('button', { name: 'Confirm reservation', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Your thread is in.' }),
  ).toBeVisible();
  await expect(page.locator('.success-page')).toContainText('once approved');
  await page.goto('/en/events');
  await expect(page.locator('body')).not.toContainText(
    'A shared courtyard gathering',
  );
  await page.goto('/en/admin');
  await page.locator('html[data-ready="true"]').waitFor();
  await page.getByRole('tab', { name: 'Events', exact: true }).click();
  await expect(page.getByText('1 event is awaiting review')).toBeVisible();
  const row = page
    .getByRole('row')
    .filter({ hasText: 'A shared courtyard gathering' });
  await expect(row).toContainText('In review');
  await row
    .getByRole('button', { name: 'Approve and publish', exact: true })
    .click();
  await expect(row).toContainText('Published');
  await page.goto('/en/events');
  await page.locator('html[data-ready="true"]').waitFor();
  await page
    .getByRole('link', { name: 'A shared courtyard gathering' })
    .first()
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'A shared courtyard gathering',
  );
  await expect(page.locator('body')).not.toContainText(
    'private-test@example.invalid',
  );
  await expect(page.locator('body')).not.toContainText('+961 71 123456');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Add to calendar' }).click();
  expect((await download).suggestedFilename()).toMatch(/\.ics$/);
});
test('booking conflict offers a usable alternative and preserves event details', async ({
  page,
}) => {
  await details(page);
  await page.getByRole('button', { name: /\b7 March 2027\b/ }).click();
  await organiser(page);
  await page
    .getByRole('checkbox', { name: 'Preview a booking conflict', exact: true })
    .press('Space');
  await page
    .getByRole('button', { name: 'Confirm reservation', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toContainText(
    'That moment has just been taken.',
  );
  await page
    .getByRole('button', { name: 'Choose this slot', exact: true })
    .first()
    .click();
  await expect(
    page.getByRole('heading', { name: 'One last look.' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Confirm reservation', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Your thread is in.' }),
  ).toBeVisible();
});
test('autosave survives reload and can be cleared', async ({ page }) => {
  await page.goto('/en/submit');
  await page
    .getByLabel('Event title', { exact: false })
    .fill('A draft worth saving');
  await page.waitForTimeout(600);
  await page.reload();
  await expect(page.getByLabel('Event title', { exact: false })).toHaveValue(
    'A draft worth saving',
  );
  await page.getByRole('button', { name: 'Clear draft', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Clear draft', exact: true })
    .click();
  await expect(page.getByLabel('Event title', { exact: false })).toHaveValue(
    '',
  );
});
test('admin confirms cancellation, creates a draft, deletes it and exports CSV', async ({
  page,
}) => {
  await page.goto('/en/admin');
  await page
    .getByRole('button', { name: 'Cancel reservation', exact: true })
    .first()
    .click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Cancel reservation', exact: true })
    .click();
  await expect(page.getByRole('table')).not.toContainText(
    'An evening by the sea',
  );
  await page.getByRole('tab', { name: 'News', exact: true }).click();
  await page.getByRole('button', { name: 'New post', exact: true }).click();
  await page
    .getByLabel('Title in English', { exact: true })
    .fill('A newly drafted community story');
  await page
    .getByLabel('Title in Arabic', { exact: true })
    .fill('حكاية جديدة من المجتمع');
  await page
    .getByLabel('Text in English', { exact: true })
    .fill('A sample draft about the shared cultural life of the city.');
  await page
    .getByLabel('Text in Arabic', { exact: true })
    .fill('مسودة تجريبية عن الحياة الثقافية المشتركة في المدينة.');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  const row = page
    .getByRole('row')
    .filter({ hasText: 'A newly drafted community story' });
  await expect(row).toContainText('Draft');
  await row.getByRole('button', { name: 'Delete', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Delete', exact: true })
    .click();
  await expect(row).toHaveCount(0);
  await page.getByRole('tab', { name: 'Export', exact: true }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download reservations CSV' }).click();
  expect((await download).suggestedFilename()).toBe('saida-reservations.csv');
});
test('contact preview validates fields and clearly does not send email', async ({
  page,
}) => {
  await page.goto('/en/contact');
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();
  await page.getByLabel('Your name', { exact: false }).fill('A Test');
  await page
    .getByLabel('Email address', { exact: false })
    .fill('test@example.invalid');
  await page
    .getByLabel('Your message', { exact: false })
    .fill('I would like more information about the programme.');
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(page.getByRole('status')).toContainText(
    'Your message has not been sent',
  );
});
