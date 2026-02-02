import { expect, Page, test } from '@playwright/test';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import testCleanupDatabase from 'src/shared/test/testCleanDatabase';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';
import errorMap from 'src/translation/en/zodEn';

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

  await page.waitForURL('/auth/verify-email/request');

  const prisma = await prismaDangerouslyBypassAuth();
  await prisma.user.updateMany({ data: { emailVerified: true } });

  await page.goto('/');
}

if (process.env.NEXT_PUBLIC_TENANT_MODE === 'multi') {
  test.beforeEach(async ({ page }) => {
    await testCleanupDatabase();
  });

  test('validates empty name', async ({ page }) => {
    await signIn(page);
    await page.waitForURL('/auth/tenant');

    const input = page.locator('input[name="name"]');
    await input.fill('');

    const button = page.getByRole('button', {
      name: dictionary.auth.tenant.create.button,
    });
    await button.click();

    await page.waitForSelector('[data-testid="name-error"]');

    await expect(page.getByTestId('name-error')).toHaveText(
      errorMap(
        {
          code: 'too_small',
          minimum: 1,
          path: ['name'],
          type: 'string',
          inclusive: true,
        },
        { defaultError: '', data: null },
      ).message,
    );
  });

  test('creates tenant', async ({ page }) => {
    await signIn(page);
    await page.waitForURL('/auth/tenant');

    const input = page.locator('input[name="name"]');
    await input.fill('ScaffoldHub');

    const button = page.getByRole('button', {
      name: dictionary.auth.tenant.create.button,
    });
    await button.click();

    await page.waitForURL('/auth/profile-onboard');
    await expect(page.url().endsWith('/auth/profile-onboard')).toBeTruthy();

    const prisma = await prismaDangerouslyBypassAuth();
    const tenant = await prisma.tenant.findFirstOrThrow();
    expect(tenant.name).toBe('ScaffoldHub');
  });

  test('has a button to sign-out', async ({ page }) => {
    await signIn(page);

    await page.goto('/auth/tenant');

    const link = page.getByText(dictionary.auth.signOut.button);
    expect(await link.isDisabled()).toBeFalsy();
    await link.click();

    await page.waitForURL('/auth/sign-in');
    await expect(page.url().endsWith('/auth/sign-in')).toBeTruthy();
  });

  test('must be signed in', async ({ page }) => {
    await page.goto('/auth/tenant');

    await page.waitForURL('/auth/sign-in');
    await expect(page.url().endsWith('/auth/sign-in')).toBeTruthy();
  });
}
