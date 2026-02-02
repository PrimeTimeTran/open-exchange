import { expect, test } from '@playwright/test';
import dayjs from 'dayjs';
import { authPasswordResetRequestController } from 'src/features/auth/controllers/authPasswordResetRequestController';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import testCleanupDatabase from 'src/shared/test/testCleanDatabase';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';
import errorMap from 'src/translation/en/zodEn';

let token: string | null;

test.beforeEach(async ({ page }) => {
  await testCleanupDatabase();
  await authSignUpController(
    { email: 'felipe@scaffoldhub.io', password: '12345678' },
    await testContext(),
  );
  await authPasswordResetRequestController(
    { email: 'felipe@scaffoldhub.io' },
    await testContext(),
  );
  const prisma = await prismaDangerouslyBypassAuth();
  await prisma.user.updateMany({
    data: { emailVerified: true },
  });
  const user = await prisma.user.findFirstOrThrow();
  token = user?.passwordResetToken;
});

test('validates small password', async ({ page }) => {
  await page.goto(`/auth/password-reset/confirm?token=${token}`);
  const button = page.getByRole('button', {
    name: dictionary.auth.passwordResetConfirm.button,
  });
  await button.click();
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

test('invalid token', async ({ page }) => {
  token = 'INVALID_TOKEN';
  await page.goto(`/auth/password-reset/confirm?token=${token}`);
  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('12345678');

  const button = page.getByRole('button', {
    name: dictionary.auth.passwordResetConfirm.button,
  });
  await button.click();

  await page.waitForSelector('[data-testid="password-error"]');

  await expect(page.getByTestId('password-error')).toHaveText(
    dictionary.auth.errors.invalidPasswordResetToken,
  );
});

test('expired token', async ({ page }) => {
  const prisma = await prismaDangerouslyBypassAuth();
  await prisma.user.updateMany({
    data: {
      passwordResetTokenExpiresAt: dayjs().subtract(1, 'second').toDate(),
    },
  });

  await page.goto(`/auth/password-reset/confirm?token=${token}`);
  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('12345678');

  const button = page.getByRole('button', {
    name: dictionary.auth.passwordResetConfirm.button,
  });
  await button.click();

  await page.waitForSelector('[data-testid="password-error"]');

  await expect(page.getByTestId('password-error')).toHaveText(
    dictionary.auth.errors.invalidPasswordResetToken,
  );
});

test('resets password', async ({ page }) => {
  await page.goto(`/auth/password-reset/confirm?token=${token}`);
  let passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('NEW_PASSWORD');

  let button = page.getByRole('button', {
    name: dictionary.auth.passwordResetConfirm.button,
  });
  await button.click();

  await page.goto(`/auth/sign-in`);

  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill('felipe@scaffoldhub.io');

  passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('NEW_PASSWORD');

  button = page.getByRole('button', { name: dictionary.auth.signIn.button });
  await button.click();

  await page.waitForURL('/');
  await expect(page.url().endsWith('/')).toBeTruthy();
});

test('has a link to sign-in page', async ({ page }) => {
  await page.goto(`/auth/password-reset/confirm?token=${token}`);
  const link = page.getByText(dictionary.auth.passwordResetConfirm.signInLink);
  await link.click();

  await page.waitForURL('/auth/sign-in');
  await expect(page.url().endsWith('/auth/sign-in')).toBeTruthy();
});

test('redirect authenticated users to /', async ({ page }) => {
  await page.goto('/auth/sign-in');

  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill('felipe@scaffoldhub.io');

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('12345678');

  const button = page.getByRole('button', {
    name: dictionary.auth.signIn.button,
  });
  await button.click();

  const authenticatedUrl =
    process.env.NEXT_PUBLIC_TENANT_MODE === 'multi' ? '/auth/tenant' : '/';

  await page.waitForURL(authenticatedUrl);
  await expect(page.url().endsWith(authenticatedUrl)).toBeTruthy();

  await page.goto('/auth/password-reset/confirm');
  await page.waitForURL(authenticatedUrl);
  await expect(page.url().endsWith(authenticatedUrl)).toBeTruthy();
});
