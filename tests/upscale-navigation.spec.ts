import { test, expect } from '@playwright/test';

test.describe('Navigation Flows', () => {
  test('landing page -> signup -> login -> forgot password -> login', async ({ page }) => {
    // Start at landing
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Manage Construction Projects/i })).toBeVisible();

    // Navigate to signup via CTA
    await page.getByRole('link', { name: /Get Started Free/i }).click();
    await expect(page).toHaveURL('/signup');
    await expect(page.locator('[data-slot="card-title"]', { hasText: 'Create Account' })).toBeVisible();

    // Navigate to login from signup
    await page.getByRole('link', { name: 'Log in' }).click();
    await expect(page).toHaveURL('/login');
    await expect(page.locator('[data-slot="card-title"]', { hasText: 'Log In' })).toBeVisible();

    // Navigate to forgot password
    await page.getByRole('link', { name: 'Forgot password?' }).click();
    await expect(page).toHaveURL('/forgot-password');
    await expect(page.locator('[data-slot="card-title"]', { hasText: 'Reset Password' })).toBeVisible();

    // Navigate back to login
    await page.getByRole('link', { name: 'Back to login' }).click();
    await expect(page).toHaveURL('/login');
  });

  test('header Log In button takes user to login page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Log In' }).click();
    await expect(page).toHaveURL('/login');
  });

  test('pricing Get Started button navigates to signup', async ({ page }) => {
    await page.goto('/');
    const pricingSection = page.locator('#pricing');
    await pricingSection.scrollIntoViewIfNeeded();
    await pricingSection.getByRole('link', { name: 'Get Started', exact: true }).click();
    await expect(page).toHaveURL('/signup');
  });

  test('pricing Start Free Trial button navigates to signup', async ({ page }) => {
    await page.goto('/');
    const pricingSection = page.locator('#pricing');
    await pricingSection.scrollIntoViewIfNeeded();
    await pricingSection.getByRole('link', { name: 'Start Free Trial' }).click();
    await expect(page).toHaveURL('/signup');
  });

  test('unauthenticated user visiting /dashboard gets redirected to /login', async ({ page }) => {
    await page.goto('/dashboard');
    // Should redirect to login (the proxy protects /dashboard)
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Route Protection', () => {
  test('unauthenticated access to /dashboard redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/login/, { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  test('unauthenticated access to /settings redirects to login', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForURL(/\/login/, { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });
});

test.describe('Page Responsiveness', () => {
  test('landing page loads without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Filter out known benign errors (like Supabase connection issues in dev)
    const criticalErrors = consoleErrors.filter(
      (err) => !err.includes('supabase') && !err.includes('Failed to fetch')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('all pages return 200 or redirect properly', async ({ page }) => {
    const publicPages = ['/', '/login', '/signup', '/forgot-password'];
    for (const route of publicPages) {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(400);
    }
  });
});
