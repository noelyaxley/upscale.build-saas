import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('displays the login form', async ({ page }) => {
    await expect(page.locator('[data-slot="card-title"]', { hasText: 'Log In' })).toBeVisible();
    await expect(page.getByText('Enter your credentials to sign in')).toBeVisible();
  });

  test('has email and password fields', async ({ page }) => {
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('email field has correct placeholder', async ({ page }) => {
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
  });

  test('has Sign In submit button', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: 'Sign In' });
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();
  });

  test('has forgot password link', async ({ page }) => {
    const forgotLink = page.getByRole('link', { name: 'Forgot password?' });
    await expect(forgotLink).toBeVisible();
    await expect(forgotLink).toHaveAttribute('href', '/forgot-password');
  });

  test('has sign up link', async ({ page }) => {
    const signupLink = page.getByRole('link', { name: 'Sign up' });
    await expect(signupLink).toBeVisible();
    await expect(signupLink).toHaveAttribute('href', '/signup');
  });

  test('forgot password link navigates correctly', async ({ page }) => {
    await page.getByRole('link', { name: 'Forgot password?' }).click();
    await expect(page).toHaveURL('/forgot-password');
  });

  test('sign up link navigates correctly', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign up' }).click();
    await expect(page).toHaveURL('/signup');
  });

  test('email field is required', async ({ page }) => {
    const emailInput = page.getByLabel('Email');
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('password field is required', async ({ page }) => {
    const passwordInput = page.getByLabel('Password');
    await expect(passwordInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('can type into email and password fields', async ({ page }) => {
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await expect(page.getByLabel('Email')).toHaveValue('test@example.com');
    await expect(page.getByLabel('Password')).toHaveValue('password123');
  });

  test('shows loading state when form is submitted', async ({ page }) => {
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign In' }).click();
    // Button should show loading text briefly
    await expect(page.getByRole('button', { name: /Signing in/i })).toBeVisible();
  });
});

test.describe('Signup Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('displays the signup form', async ({ page }) => {
    await expect(page.locator('[data-slot="card-title"]', { hasText: 'Create Account' })).toBeVisible();
    await expect(page.getByText('Sign up to get started')).toBeVisible();
  });

  test('has email and password fields', async ({ page }) => {
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('password field has placeholder with minimum length hint', async ({ page }) => {
    await expect(page.getByPlaceholder('At least 6 characters')).toBeVisible();
  });

  test('password has minLength validation', async ({ page }) => {
    const passwordInput = page.getByLabel('Password');
    await expect(passwordInput).toHaveAttribute('minlength', '6');
  });

  test('has Sign Up submit button', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: 'Sign Up' });
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toBeEnabled();
  });

  test('has login link for existing users', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: 'Log in' });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', '/login');
  });

  test('login link navigates correctly', async ({ page }) => {
    await page.getByRole('link', { name: 'Log in' }).click();
    await expect(page).toHaveURL('/login');
  });

  test('can fill out the signup form', async ({ page }) => {
    await page.getByLabel('Email').fill('newuser@example.com');
    await page.getByLabel('Password').fill('securepass123');
    await expect(page.getByLabel('Email')).toHaveValue('newuser@example.com');
    await expect(page.getByLabel('Password')).toHaveValue('securepass123');
  });
});

test.describe('Forgot Password Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password');
  });

  test('displays the reset password form', async ({ page }) => {
    await expect(page.locator('[data-slot="card-title"]', { hasText: 'Reset Password' })).toBeVisible();
    await expect(
      page.getByText('Enter your email to receive a reset link')
    ).toBeVisible();
  });

  test('has email field', async ({ page }) => {
    await expect(page.getByLabel('Email')).toBeVisible();
  });

  test('has Send Reset Link button', async ({ page }) => {
    const btn = page.getByRole('button', { name: 'Send Reset Link' });
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test('has back to login link', async ({ page }) => {
    const backLink = page.getByRole('link', { name: 'Back to login' });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/login');
  });

  test('back to login navigates correctly', async ({ page }) => {
    await page.getByRole('link', { name: 'Back to login' }).click();
    await expect(page).toHaveURL('/login');
  });
});
