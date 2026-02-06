import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads successfully with correct title', async ({ page }) => {
    await expect(page).toHaveURL('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test.describe('Header', () => {
    test('displays Upscale.Build logo/brand in header', async ({ page }) => {
      const header = page.locator('header');
      await expect(header.getByRole('link', { name: /Upscale\.Build/i })).toBeVisible();
    });

    test('shows Features and Pricing nav links on desktop', async ({ page }) => {
      const featuresLink = page.getByRole('link', { name: 'Features' }).first();
      const pricingLink = page.getByRole('link', { name: 'Pricing' }).first();
      await expect(featuresLink).toBeVisible();
      await expect(pricingLink).toBeVisible();
    });

    test('shows Log In button when not authenticated', async ({ page }) => {
      const loginBtn = page.getByRole('link', { name: 'Log In' });
      await expect(loginBtn).toBeVisible();
    });

    test('Log In button navigates to /login', async ({ page }) => {
      await page.getByRole('link', { name: 'Log In' }).click();
      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Hero Section', () => {
    test('displays the main headline', async ({ page }) => {
      const headline = page.getByRole('heading', { name: /Manage Construction Projects/i });
      await expect(headline).toBeVisible();
    });

    test('displays the tagline text', async ({ page }) => {
      await expect(page.getByText('Built for construction teams')).toBeVisible();
    });

    test('displays the subheading description', async ({ page }) => {
      await expect(
        page.getByText(/Track progress, control documents, manage budgets/)
      ).toBeVisible();
    });

    test('has Get Started Free button linking to /signup', async ({ page }) => {
      const cta = page.getByRole('link', { name: /Get Started Free/i });
      await expect(cta).toBeVisible();
      await expect(cta).toHaveAttribute('href', '/signup');
    });

    test('has See Features button linking to #features', async ({ page }) => {
      const btn = page.getByRole('link', { name: /See Features/i });
      await expect(btn).toBeVisible();
      await expect(btn).toHaveAttribute('href', '#features');
    });

    test('Get Started Free navigates to signup', async ({ page }) => {
      await page.getByRole('link', { name: /Get Started Free/i }).click();
      await expect(page).toHaveURL('/signup');
    });
  });

  test.describe('Features Section', () => {
    test('displays the features heading', async ({ page }) => {
      const heading = page.getByRole('heading', {
        name: /Everything you need to deliver projects/i,
      });
      await expect(heading).toBeVisible();
    });

    test('displays all 6 feature cards', async ({ page }) => {
      const features = [
        'Project Tracking',
        'Document Control',
        'Budget Management',
        'Team Collaboration',
        'Defect Management',
        'Reporting',
      ];

      for (const feature of features) {
        await expect(
          page.locator('[data-slot="card-title"]', { hasText: feature })
        ).toBeVisible();
      }
    });

    test('each feature has a description', async ({ page }) => {
      await expect(
        page.getByText(/Monitor project stages from preconstruction/)
      ).toBeVisible();
      await expect(
        page.getByText(/Centralise drawings, specs, RFIs/)
      ).toBeVisible();
      await expect(
        page.getByText(/Track budgets, variations, and cost-to-complete/)
      ).toBeVisible();
    });
  });

  test.describe('Pricing Section', () => {
    test('displays the pricing heading', async ({ page }) => {
      const heading = page.getByRole('heading', {
        name: /Simple, transparent pricing/i,
      });
      await expect(heading).toBeVisible();
    });

    test('displays all 3 pricing tiers', async ({ page }) => {
      const pricingSection = page.locator('#pricing');
      await expect(pricingSection.locator('[data-slot="card-title"]', { hasText: 'Starter' })).toBeVisible();
      await expect(pricingSection.locator('[data-slot="card-title"]', { hasText: 'Professional' })).toBeVisible();
      await expect(pricingSection.locator('[data-slot="card-title"]', { hasText: 'Enterprise' })).toBeVisible();
    });

    test('displays correct prices', async ({ page }) => {
      const pricingSection = page.locator('#pricing');
      await expect(pricingSection.getByText('$0')).toBeVisible();
      await expect(pricingSection.getByText('$49')).toBeVisible();
      await expect(pricingSection.getByText('Custom', { exact: true })).toBeVisible();
    });

    test('Professional tier is highlighted as Most Popular', async ({ page }) => {
      await expect(page.getByText('Most Popular')).toBeVisible();
    });

    test('displays feature lists for each tier', async ({ page }) => {
      await expect(page.getByText('1 project')).toBeVisible();
      await expect(page.getByText('Up to 10 projects')).toBeVisible();
      await expect(page.getByText('Unlimited projects')).toBeVisible();
    });

    test('CTA buttons link to correct pages', async ({ page }) => {
      const pricingSection = page.locator('#pricing');

      const getStartedBtn = pricingSection.getByRole('link', { name: 'Get Started', exact: true });
      await expect(getStartedBtn).toHaveAttribute('href', '/signup');

      const freeTrialBtn = pricingSection.getByRole('link', { name: 'Start Free Trial' });
      await expect(freeTrialBtn).toHaveAttribute('href', '/signup');

      const contactBtn = pricingSection.getByRole('link', { name: 'Contact Sales' });
      await expect(contactBtn).toHaveAttribute('href', 'mailto:sales@upscale.build');
    });
  });

  test.describe('Footer', () => {
    test('displays the brand name in footer', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer.getByRole('link', { name: /Upscale\.Build/i })).toBeVisible();
    });

    test('displays footer description', async ({ page }) => {
      await expect(
        page.getByText('Construction project management built for modern teams.')
      ).toBeVisible();
    });

    test('shows Product, Company, and Legal categories', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer.getByText('Product')).toBeVisible();
      await expect(footer.getByText('Company')).toBeVisible();
      await expect(footer.getByText('Legal')).toBeVisible();
    });

    test('displays copyright notice', async ({ page }) => {
      const year = new Date().getFullYear();
      await expect(
        page.getByText(`${year} Upscale.Build. All rights reserved.`)
      ).toBeVisible();
    });
  });
});
