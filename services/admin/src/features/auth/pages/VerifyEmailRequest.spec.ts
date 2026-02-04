import { Page, expect, test } from '@playwright/test';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import testCleanupDatabase from 'src/shared/test/testCleanDatabase';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';

async function signIn(page: Page) {
  await authSignUpController(
    { email: 'felipe@scaffoldhub.io', password: '12345678' },
    await testContext(),
  );

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
});

test('send verification email', async ({ page }) => {
  await signIn(page);

  await page.goto('/auth/verify-email/request');

  const button = page.getByRole('button', {
    name: dictionary.auth.verifyEmailRequest.button,
  });
  await button.click();

  const successButton = page.getByText(
    dictionary.auth.verifyEmailRequest.success,
  );
  expect(successButton).toBeTruthy();
});

test('redirects if email already confirmed', async ({ page }) => {
  await signIn(page);

  const prisma = await prismaDangerouslyBypassAuth();
  await prisma.user.updateMany({ data: { emailVerified: true } });

  await page.goto('/auth/verify-email/request');

  const authenticatedUrl =
    process.env.NEXT_PUBLIC_TENANT_MODE === 'multi' ? '/auth/tenant' : '/';
  await page.waitForURL(authenticatedUrl);
  await expect(page.url().endsWith(authenticatedUrl)).toBeTruthy();
});

test('has a button to sign-out', async ({ page }) => {
  await signIn(page);

  await page.goto('/auth/verify-email/request');

  const link = page.getByText(dictionary.auth.signOut.button);
  expect(await link.isDisabled()).toBeFalsy();
  await link.click();

  await page.waitForURL('/auth/sign-in');
  await expect(page.url().endsWith('/auth/sign-in')).toBeTruthy();
});

test('must be signed in', async ({ page }) => {
  await page.goto('/auth/verify-email/request');

  await page.waitForURL('/auth/sign-in');
  await expect(page.url().endsWith('/auth/sign-in')).toBeTruthy();
});
