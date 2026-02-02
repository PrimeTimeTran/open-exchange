import { expect, test } from '@playwright/test';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import testCleanupDatabase from 'src/shared/test/testCleanDatabase';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';
import errorMap from 'src/translation/en/zodEn';

test.beforeEach(async ({ page }) => {
  await testCleanupDatabase();
  await page.goto('/auth/sign-in');
});

test.describe('empty form', () => {
  test.beforeEach(async ({ page }) => {
    const button = page.getByText(dictionary.auth.signIn.button);
    await button.click();
  });

  test('validates small password', async ({ page }) => {
    await expect(page.getByTestId('password-error')).toHaveText(
      errorMap(
        {
          code: 'too_small',
          minimum: 8,
          path: ['password'],
          type: 'string',
          inclusive: true,
        },
        { defaultError: '', data: null },
      ).message,
    );
  });

  test('validates small email', async ({ page }) => {
    await expect(page.getByTestId('email-error')).toHaveText(
      errorMap(
        {
          code: 'too_small',
          minimum: 1,
          path: ['email'],
          type: 'string',
          inclusive: true,
        },
        { defaultError: '', data: null },
      ).message,
    );
  });
});

test('validates invalid email', async ({ page }) => {
  const input = page.locator('input[name="email"]');
  await input.fill('invalid_email');

  const button = page.getByText(dictionary.auth.signIn.button);
  await button.click();

  await expect(page.getByTestId('email-error')).toHaveText(
    errorMap(
      {
        validation: 'email',
        code: 'invalid_string',
        path: ['email'],
      },
      { defaultError: '', data: null },
    ).message,
  );
});

test('invalid credentials', async ({ page }) => {
  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill('felipe@scaffoldhub.io');

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('invalid_password');

  const button = page.getByText(dictionary.auth.signIn.button);
  await button.click();

  await page.waitForSelector('[data-testid="email-error"]');

  await expect(page.getByTestId('email-error')).toHaveText(
    dictionary.auth.errors.userNotFound,
  );
});

test('signs in', async ({ page }) => {
  await authSignUpController(
    { email: 'felipe@scaffoldhub.io', password: '12345678' },
    await testContext(),
  );

  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill('felipe@scaffoldhub.io');

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('12345678');

  const button = page.getByText(dictionary.auth.signIn.button);
  await button.click();

  await page.waitForURL('/');
  await expect(page.url().endsWith('/')).toBeTruthy();
});

test('has a link to forgot password page', async ({ page }) => {
  const link = page.getByText(dictionary.auth.signIn.passwordResetRequestLink);
  await link.click();

  await page.waitForURL('/auth/password-reset/request');
  await expect(
    page.url().endsWith('/auth/password-reset/request'),
  ).toBeTruthy();
});

test('has a link to sign-up page', async ({ page }) => {
  const link = page.getByText(dictionary.auth.signIn.signUpLink);
  await link.click();

  await page.waitForURL('/auth/sign-up');
  await expect(page.url().endsWith('/auth/sign-up')).toBeTruthy();
});

test('redirect authenticated users to /', async ({ page }) => {
  await authSignUpController(
    { email: 'felipe@scaffoldhub.io', password: '12345678' },
    await testContext(),
  );
  const prisma = await prismaDangerouslyBypassAuth();
  await prisma.user.updateMany({
    data: { emailVerified: true },
  });

  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill('felipe@scaffoldhub.io');

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('12345678');

  const button = page.getByText(dictionary.auth.signIn.button);
  await button.click();

  const authenticatedUrl =
    process.env.NEXT_PUBLIC_TENANT_MODE === 'multi' ? '/auth/tenant' : '/';

  await page.waitForURL(authenticatedUrl);
  await expect(page.url().endsWith(authenticatedUrl)).toBeTruthy();

  await page.goto('/auth/sign-in');
  await page.waitForURL(authenticatedUrl);
  await expect(page.url().endsWith(authenticatedUrl)).toBeTruthy();
});
