import { expect, Page, test } from '@playwright/test';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { tenantCreateController } from 'src/features/tenant/controllers/tenantCreateController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import testCleanupDatabase from 'src/shared/test/testCleanDatabase';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';
import errorMap from 'src/translation/en/zodEn';

async function signUp(page: Page, password: string) {
  await authSignUpController(
    { email: 'felipe@scaffoldhub.io', password },
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

  await signIn(page, password);
}

async function signIn(page: Page, password: string) {
  await page.goto('/auth/sign-in');

  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill('felipe@scaffoldhub.io');

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill(password);

  const button = page.getByText(dictionary.auth.signIn.button);
  await button.click();

  await page.waitForURL('/');
}

test.beforeEach(async ({ page }) => {
  await testCleanupDatabase();
});

test('old password is required', async ({ page }) => {
  await signUp(page, 'OLD_PASSWORD');
  await page.goto('/auth/password-change');

  const oldPasswordInput = page.locator('input[name="oldPassword"]');
  await oldPasswordInput.fill('');

  const button = page.getByText(dictionary.auth.passwordChange.button);
  await button.click();

  await expect(page.getByTestId('oldPassword-error')).toHaveText(
    errorMap(
      {
        code: 'too_small',
        minimum: 1,
        path: ['oldPassword'],
        type: 'string',
        inclusive: true,
      },
      { defaultError: '', data: null },
    ).message,
  );
});

test('new password is required', async ({ page }) => {
  await signUp(page, 'OLD_PASSWORD');
  await page.goto('/auth/password-change');

  const newPasswordInput = page.locator('input[name="newPassword"]');
  await newPasswordInput.fill('');

  const button = page.getByText(dictionary.auth.passwordChange.button);
  await button.click();

  await expect(page.getByTestId('newPassword-error')).toHaveText(
    errorMap(
      {
        code: 'too_small',
        minimum: 8,
        path: ['newPassword'],
        type: 'string',
        inclusive: true,
      },
      { defaultError: '', data: null },
    ).message,
  );
});

test('new password confirmation is required', async ({ page }) => {
  await signUp(page, 'OLD_PASSWORD');
  await page.goto('/auth/password-change');

  const newPasswordConfirmationInput = page.locator(
    'input[name="newPasswordConfirmation"]',
  );
  await newPasswordConfirmationInput.fill('');

  const button = page.getByText(dictionary.auth.passwordChange.button);
  await button.click();

  await expect(page.getByTestId('newPasswordConfirmation-error')).toHaveText(
    errorMap(
      {
        code: 'too_small',
        minimum: 8,
        path: ['newPasswordConfirmation'],
        type: 'string',
        inclusive: true,
      },
      { defaultError: '', data: null },
    ).message,
  );
});

test('passwords must match', async ({ page }) => {
  await signUp(page, 'OLD_PASSWORD');
  await page.goto('/auth/password-change');

  const oldPasswordInput = page.locator('input[name="oldPassword"]');
  await oldPasswordInput.fill('OLD_PASSWORD');

  const newPasswordInput = page.locator('input[name="newPassword"]');
  await newPasswordInput.fill('NEW_PASSWORD');

  const newPasswordConfirmationInput = page.locator(
    'input[name="newPasswordConfirmation"]',
  );
  await newPasswordConfirmationInput.fill('DIFFERENT_PASSWORD');

  const button = page.getByText(dictionary.auth.passwordChange.button);
  await button.click();

  await expect(page.getByTestId('newPasswordConfirmation-error')).toHaveText(
    dictionary.auth.passwordChange.mustMatch,
  );
});

test('changes password and redirect to sign-in', async ({ page }) => {
  await signUp(page, 'OLD_PASSWORD');
  await page.goto('/auth/password-change');

  const oldPasswordInput = page.locator('input[name="oldPassword"]');
  await oldPasswordInput.fill('OLD_PASSWORD');

  const newPasswordInput = page.locator('input[name="newPassword"]');
  await newPasswordInput.fill('NEW_PASSWORD');

  const newPasswordConfirmationInput = page.locator(
    'input[name="newPasswordConfirmation"]',
  );
  await newPasswordConfirmationInput.fill('NEW_PASSWORD');

  const button = page.getByText(dictionary.auth.passwordChange.button);
  await button.click();

  await page.waitForURL('/auth/sign-in');
  await expect(page.url().endsWith('/auth/sign-in')).toBeTruthy();

  await signIn(page, 'NEW_PASSWORD');

  await page.waitForURL('/');
  expect(page.url().endsWith('/')).toBeTruthy();
});
