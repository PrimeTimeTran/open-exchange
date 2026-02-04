import { expect, Page, test } from '@playwright/test';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { tenantCreateController } from 'src/features/tenant/controllers/tenantCreateController';
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

  const prisma = await prismaDangerouslyBypassAuth();
  await prisma.user.updateMany({ data: { emailVerified: true } });
  const user = await prisma.user.findFirstOrThrow();
  try {
    await tenantCreateController(
      {
        name: 'ScaffoldHub',
      },
      await testContext({ currentUserId: user.id }),
    );
  } catch (error) {
    // skip, may be single tenant
  }
  await prisma.membership.updateMany({
    data: {
      firstName: 'Felipe',
      lastName: 'Lima',
    },
  });

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

test('first name is required', async ({ page }) => {
  await signIn(page);
  await page.goto('/auth/profile');

  const firstNameInput = page.locator('input[name="firstName"]');
  await firstNameInput.fill('');

  const button = page.getByText(dictionary.auth.profile.button);
  await button.click();

  await expect(page.getByTestId('firstName-error')).toHaveText(
    errorMap(
      {
        code: 'too_small',
        minimum: 1,
        path: ['firstName'],
        type: 'string',
        inclusive: true,
      },
      { defaultError: '', data: null },
    ).message,
  );
});

test('last name is required', async ({ page }) => {
  await signIn(page);
  await page.goto('/auth/profile');

  const lastNameInput = page.locator('input[name="lastName"]');
  await lastNameInput.fill('');

  const button = page.getByText(dictionary.auth.profile.button);
  await button.click();

  await expect(page.getByTestId('lastName-error')).toHaveText(
    errorMap(
      {
        code: 'too_small',
        minimum: 1,
        path: ['lastName'],
        type: 'string',
        inclusive: true,
      },
      { defaultError: '', data: null },
    ).message,
  );
});

test('saves profile and redirect', async ({ page }) => {
  await signIn(page);
  await page.goto('/auth/profile');

  const firstNameInput = page.locator('input[name="firstName"]');
  await firstNameInput.fill('John');

  const lastNameInput = page.locator('input[name="lastName"]');
  await lastNameInput.fill('Doe');

  const button = page.getByText(dictionary.auth.profile.button);
  await button.click();

  await page.waitForURL('/');
  await expect(page.url().endsWith('/')).toBeTruthy();

  const prisma = await prismaDangerouslyBypassAuth();
  const membership = await prisma.membership.findFirstOrThrow();
  expect(membership.firstName).toBe('John');
  expect(membership.lastName).toBe('Doe');
});
