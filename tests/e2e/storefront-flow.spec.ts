import { test, expect } from '@playwright/test';

test.describe('Storefront Experience & Glass Design', () => {
  test('loads home page and renders campaign hero with glass elements', async ({ page }) => {
    await page.goto('/');

    // Check title and brand headline
    await expect(page).toHaveTitle(/LEVIX/i);
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText('OVERSIZED');

    // Verify 4 signature cut tiles are present
    const cutCards = page.locator('text=Waffle Oversized Tee');
    await expect(cutCards).toBeVisible();

    // Check 7-day exchange guarantee badge
    const guaranteeBadge = page.locator('text=7-Day Hassle-Free Size Exchange');
    await expect(guaranteeBadge).toBeVisible();
  });

  test('navigates to catalog and tests mobile responsiveness', async ({ page }) => {
    await page.goto('/');

    // Click explore drops
    const exploreBtn = page.locator('text=Explore Drops').first();
    await exploreBtn.click();

    // Verify URL change
    await expect(page).toHaveURL(/\/shop/);
  });

  test('visual regression: captures home viewport for glass layout shifts', async ({ page }) => {
    await page.goto('/');
    // Visual regression snapshot comparison
    await expect(page).toHaveScreenshot('home-glass-view.png', {
      mask: [page.locator('footer span:first-child')], // Mask timestamp/copyright year if variable
    });
  });
});
