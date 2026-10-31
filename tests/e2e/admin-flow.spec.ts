import { test, expect } from '@playwright/test';

test.describe('Admin Operations & Security Guard', () => {
  test('unauthenticated user trying to access /admin gets blocked or redirected', async ({ page }) => {
    // Attempt visiting admin without credentials
    await page.goto('/admin');

    // Either redirected to login or presented with 403 Access Restricted screen
    const isLogin = page.url().includes('/login');
    const isRestricted = await page.locator('text=403').isVisible();

    expect(isLogin || isRestricted).toBe(true);
  });

  test('authenticated admin can view operations dashboard with KPI cards', async ({ page, context }) => {
    // Set simulated admin auth cookie
    await context.addCookies([
      {
        name: '__session',
        value: 'mock-admin-token-123',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/admin');

    // Confirm admin command heading
    await expect(page.locator('text=Operations Command')).toBeVisible();

    // Check KPI Cards
    await expect(page.locator('text=Gross Revenue')).toBeVisible();
    await expect(page.locator('text=Total Orders')).toBeVisible();
    await expect(page.locator('text=Active Streetwear Fans')).toBeVisible();

    // Visual snapshot comparison of Admin Glass Dashboard
    await expect(page).toHaveScreenshot('admin-dashboard-glass.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('admin can navigate to Product Matrix generator', async ({ page, context }) => {
    await context.addCookies([
      {
        name: '__session',
        value: 'mock-admin-token-123',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/admin/products/new');
    await expect(page.locator('text=Garment Specifications')).toBeVisible();
    await expect(page.locator('text=Variant Matrix (Color × Size)')).toBeVisible();
  });
});
