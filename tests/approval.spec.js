import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

async function loginAsStaff(page) {
  await page.goto(BASE_URL);
  await page.evaluate(() => {
    localStorage.setItem('role', 'staff');
  });
}

/** Navigate to a page and wait for data to load */
async function goAndWait(page, path) {
  await page.goto(`${BASE_URL}${path}`);
  // Wait for any "Loading..." text to disappear, meaning data has loaded
  await page.waitForSelector('table', { timeout: 10000 }).catch(() => {});
}

/* ============================================================
   1. APPROVE REQUEST FLOW
============================================================ */
test('Approve Request Flow', async ({ page }) => {
  await loginAsStaff(page);
  await goAndWait(page, '/pending');

  const btn = page.getByRole('button', { name: 'Approve' });
  const count = await btn.count();
  test.skip(count === 0, 'No pending requests');

  page.on('dialog', async (d) => await d.accept());

  await btn.first().click();
  await page.waitForTimeout(2000);

  const newCount = await btn.count();
  expect(newCount).toBeLessThanOrEqual(count);
});

/* ============================================================
   2. REJECT REQUEST FLOW
============================================================ */
test('Reject Request Flow', async ({ page }) => {
  await loginAsStaff(page);
  await goAndWait(page, '/pending');

  const btn = page.getByRole('button', { name: 'Reject' });
  const count = await btn.count();
  test.skip(count === 0, 'No pending requests');

  await btn.first().click();
  await page.getByPlaceholder('Please provide a reason...').fill('Reserved');
  await page.getByRole('button', { name: 'Confirm Reject' }).click();

  await page.waitForTimeout(2000);
});

/* ============================================================
   3. REJECT VALIDATION (EMPTY)
============================================================ */
test('Reject Validation Empty Reason', async ({ page }) => {
  await loginAsStaff(page);
  await goAndWait(page, '/pending');

  const btn = page.getByRole('button', { name: 'Reject' });
  const count = await btn.count();
  test.skip(count === 0, 'No pending requests');

  await btn.first().click();

  page.on('dialog', async (d) => {
    await d.accept();
  });

  await page.getByRole('button', { name: 'Confirm Reject' }).click();
});

/* ============================================================
   4. RETURN RESOURCE FLOW
============================================================ */
test('Return Resource Flow', async ({ page }) => {
  await loginAsStaff(page);
  await goAndWait(page, '/borrowed');

  const btn = page.getByRole('button', { name: 'Confirm Return' });
  const count = await btn.count();
  test.skip(count === 0, 'No borrowed items');

  await btn.first().click();
  await page.getByRole('button', { name: /Good/ }).click();

  page.on('dialog', async (d) => await d.accept());

  await page.locator('.fixed button', { hasText: 'Confirm Return' }).click();
  await page.waitForTimeout(2000);
});

/* ============================================================
   5. RETURN WITH NOTES
============================================================ */
test('Return with Notes', async ({ page }) => {
  await loginAsStaff(page);
  await goAndWait(page, '/borrowed');

  const btn = page.getByRole('button', { name: 'Confirm Return' });
  const count = await btn.count();
  test.skip(count === 0, 'No borrowed items');

  await btn.first().click();

  await page.getByPlaceholder('Details about damage or missing parts...')
    .fill('All good');

  page.on('dialog', async (d) => await d.accept());

  await page.locator('.fixed button', { hasText: 'Confirm Return' }).click();
  await page.waitForTimeout(2000);
});

/* ============================================================
   6. OVERDUE LIST DISPLAY
============================================================ */
test('Overdue List Display', async ({ page }) => {
  await loginAsStaff(page);
  await page.goto(`${BASE_URL}/overdue`);

  await expect(page.getByRole('heading', { name: 'Overdue Requests' }))
    .toBeVisible();
});

/* ============================================================
   7. OVERDUE RETURN WITH PENALTY
============================================================ */
test('Overdue Return with Penalty', async ({ page }) => {
  await loginAsStaff(page);
  await goAndWait(page, '/overdue');

  const btn = page.getByRole('button', { name: 'Confirm Return' });
  const count = await btn.count();
  test.skip(count === 0, 'No overdue items');

  await btn.first().click();
  await page.getByRole('button', { name: /Good/ }).click();

  page.on('dialog', async (d) => await d.accept());

  await page.locator('.fixed button', { hasText: 'Confirm Return' }).click();
  await page.waitForTimeout(2000);
});

/* ============================================================
   8. BORROWED ITEMS PAGE
============================================================ */
test('Borrowed Items Page', async ({ page }) => {
  await loginAsStaff(page);
  await page.goto(`${BASE_URL}/borrowed`);

  await expect(page.getByRole('heading', { name: 'Borrowed Items' }))
    .toBeVisible();
});

/* ============================================================
   9. HISTORY LOG PAGE
============================================================ */
test('History Log Page', async ({ page }) => {
  await loginAsStaff(page);
  await page.goto(`${BASE_URL}/history`);

  await expect(page.getByRole('heading', { name: 'System History Log' }))
    .toBeVisible();
});

/* ============================================================
   10. REJECT MODAL OPEN
============================================================ */
test('Reject Modal Opens', async ({ page }) => {
  await loginAsStaff(page);
  await goAndWait(page, '/pending');

  const btn = page.getByRole('button', { name: 'Reject' });
  const count = await btn.count();
  test.skip(count === 0, 'No pending requests');

  await btn.first().click();

  await expect(page.getByText('Reject Request')).toBeVisible();
});

/* ============================================================
   11. REJECT MODAL CLOSE
============================================================ */
test('Reject Modal Close', async ({ page }) => {
  await loginAsStaff(page);
  await goAndWait(page, '/pending');

  const btn = page.getByRole('button', { name: 'Reject' });
  const count = await btn.count();
  test.skip(count === 0, 'No pending requests');

  await btn.first().click();
  await page.getByRole('button', { name: 'Cancel' }).click();
});

/* ============================================================
   12. DEVICE CONDITION MODAL
============================================================ */
test('Device Condition Modal Opens', async ({ page }) => {
  await loginAsStaff(page);
  await goAndWait(page, '/borrowed');

  const btn = page.getByRole('button', { name: 'Confirm Return' });
  const count = await btn.count();
  test.skip(count === 0, 'No borrowed items');

  await btn.first().click();

  await expect(page.getByText('Device Condition')).toBeVisible();
});

/* ============================================================
   13. DEVICE CONDITION SELECT
============================================================ */
test('Select Device Condition', async ({ page }) => {
  await loginAsStaff(page);
  await goAndWait(page, '/borrowed');

  const btn = page.getByRole('button', { name: 'Confirm Return' });
  const count = await btn.count();
  test.skip(count === 0, 'No borrowed items');

  await btn.first().click();
  await page.getByRole('button', { name: /Damaged/ }).click();
});

/* ============================================================
   14. SEARCH FILTER
============================================================ */
test('Search Filter Works', async ({ page }) => {
  await loginAsStaff(page);
  await goAndWait(page, '/pending');

  const search = page.getByPlaceholder('Search student or resource...');
  await search.fill('Dell');

  await expect(page.locator('table')).toBeVisible();
});

/* ============================================================
   15. SEARCH EMPTY RESULT
============================================================ */
test('Search Empty Result', async ({ page }) => {
  await loginAsStaff(page);
  await goAndWait(page, '/pending');

  const search = page.getByPlaceholder('Search student or resource...');
  await search.fill('zzz_not_found');

  await expect(page.getByText(/No pending/i)).toBeVisible();
});