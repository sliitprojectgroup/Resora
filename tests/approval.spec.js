import { test, expect } from '@playwright/test';

test('approve request flow', async ({ page }) => {
  await page.goto('http://localhost:3000/pending');

  await page.click('text=Approve');

  await expect(page.locator('text=Approved')).toBeVisible();
});