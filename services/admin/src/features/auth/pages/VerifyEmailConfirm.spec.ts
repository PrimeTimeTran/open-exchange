import { expect, Page, test } from '@playwright/test';
import dayjs from 'dayjs';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import testCleanupDatabase from 'src/shared/test/testCleanDatabase';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';

let token: string | null;

async function signIn(page: Page) {
  await page.goto('/auth/sign-in');

  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill('felipe@scaffoldhub.io');

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('12345678');

  const button = page.getByText(dictionary.auth.signIn.button);
  await button.click();

  await page.waitForURL('/');
}

test.beforeEach(async ({ page }) => {
  await testCleanupDatabase();
  await authSignUpController(
    { email: 'felipe@scaffoldhub.io', password: '12345678' },
    await testContext(),
  );
  const prisma = await prismaDangerouslyBypassAuth();
  const user = await prisma.user.findFirstOrThrow();
  token = user?.verifyEmailToken;
});

test('invalid token', async ({ page }) => {
  token = 'INVALID_TOKEN';
  await page.goto(`/auth/verify-email/confirm?token=${token}`);
  await page.waitForSelector('[data-testid="error"]');
  await expect(page.getByTestId('error')).toHaveText(
    dictionary.auth.errors.invalidVerifyEmailToken,
  );
});

test('expired token', async ({ page }) => {
  const prisma = await prismaDangerouslyBypassAuth();
  await prisma.user.updateMany({
    data: {
      verifyEmailTokenExpiresAt: dayjs().subtract(1, 'second').toDate(),
    },
  });

  await page.goto(`/auth/verify-email/confirm?token=${token}`);

  await page.waitForSelector('[data-testid="error"]');
  await expect(page.getByTestId('error')).toHaveText(
    dictionary.auth.errors.invalidVerifyEmailToken,
  );
});

test('verify email and sign-in automatically', async ({ page }) => {
  await page.goto(`/auth/verify-email/confirm?token=${token}`);

  const authenticatedUrl =
    process.env.NEXT_PUBLIC_TENANT_MODE === 'multi' ? '/auth/tenant' : '/';
  await page.waitForURL(authenticatedUrl);
  await expect(page.url().endsWith(authenticatedUrl)).toBeTruthy();
  await page.goto(`/auth/sign-in`);
  await page.waitForURL(authenticatedUrl);
  await expect(page.url().endsWith(authenticatedUrl)).toBeTruthy();
});

test('verify email for authenticated user', async ({ page }) => {
  await signIn(page);
  await page.goto(`/auth/verify-email/confirm?token=${token}`);
  const authenticatedUrl =
    process.env.NEXT_PUBLIC_TENANT_MODE === 'multi' ? '/auth/tenant' : '/';
  await page.waitForURL(authenticatedUrl);
  await expect(page.url().endsWith(authenticatedUrl)).toBeTruthy();
});

test('has a link to sign-out on error if signed in user', async ({ page }) => {
  await signIn(page);
  token = 'INVALID_TOKEN';
  await page.goto(`/auth/verify-email/confirm?token=${token}`);
  const link = page.getByText(dictionary.auth.signOut.button);
  await link.click();

  await page.waitForURL('/auth/sign-in');
  await expect(page.url().endsWith('/auth/sign-in')).toBeTruthy();
});

test('redirects when token is empty', async ({ page }) => {
  await page.goto(`/auth/verify-email/confirm`);
  await page.waitForURL('/auth/sign-in');
  await expect(page.url().endsWith('/auth/sign-in')).toBeTruthy();
});
