import { expect, test } from '@playwright/test';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import testCleanupDatabase from 'src/shared/test/testCleanDatabase';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';
import errorMap from 'src/translation/en/zodEn';

test.beforeEach(async ({ page }) => {
  await testCleanupDatabase();
  await page.goto('/auth/sign-up');
});

test.describe('empty form', () => {
  test.beforeEach(async ({ page }) => {
    const button = page.getByRole('button', {
      name: dictionary.auth.signUp.button,
    });
    await button.click();
  });

  test('validates small password', async ({ page }) => {
    await page.waitForSelector('[data-testid="password-error"]');

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
    await page.waitForSelector('[data-testid="email-error"]');

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

  const button = page.getByRole('button', {
    name: dictionary.auth.signUp.button,
  });
  await button.click();

  await page.waitForSelector('[data-testid="email-error"]');

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

test('already exists', async ({ page }) => {
  await authSignUpController(
    {
      email: 'felipe@scaffoldhub.io',
      password: '12345678',
    },
    await testContext(),
  );

  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill('felipe@scaffoldhub.io');

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('12345678');

  const button = page.getByRole('button', {
    name: dictionary.auth.signUp.button,
  });
  await button.click();

  await page.waitForSelector('[data-testid="email-error"]');

  await expect(page.getByTestId('email-error')).toHaveText(
    dictionary.auth.errors.emailAlreadyInUse,
  );
});

test('signs up', async ({ page }) => {
  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill('felipe@scaffoldhub.io');

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('12345678');

  const button = page.getByRole('button', {
    name: dictionary.auth.signUp.button,
  });
  await button.click();

  await page.waitForURL('/');
  await expect(page.url().endsWith('/')).toBeTruthy();
});

test('has a link to sign-in page', async ({ page }) => {
  const link = page.getByText(dictionary.auth.signUp.signInLink);
  await link.click();

  await page.waitForURL('/auth/sign-in');
  await expect(page.url().endsWith('/auth/sign-in')).toBeTruthy();
});

test('redirect authenticated users to /', async ({ page }) => {
  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill('felipe@scaffoldhub.io');

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('12345678');

  const button = page.getByRole('button', {
    name: dictionary.auth.signUp.button,
  });
  await button.click();

  await page.waitForURL('/auth/verify-email/request');

  const prisma = await prismaDangerouslyBypassAuth();
  await prisma.user.updateMany({
    data: { emailVerified: true },
  });

  await page.goto('/auth/sign-up');

  const authenticatedUrl =
    process.env.NEXT_PUBLIC_TENANT_MODE === 'multi' ? '/auth/tenant' : '/';

  await page.waitForURL(authenticatedUrl);
  await expect(page.url().endsWith(authenticatedUrl)).toBeTruthy();
});
