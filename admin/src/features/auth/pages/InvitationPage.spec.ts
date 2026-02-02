import { expect, test } from '@playwright/test';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { membershipCreate } from 'src/features/membership/controllers/membershipCreateController';
import { roles } from 'src/features/roles';
import { tenantCreateController } from 'src/features/tenant/controllers/tenantCreateController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import testCleanupDatabase from 'src/shared/test/testCleanDatabase';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';

async function inviteExistingUser() {
  await authSignUpController(
    { email: 'felipe@scaffoldhub.io', password: '12345678' },
    await testContext({}),
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
      invitationToken: 'token',
      firstName: 'Felipe',
      lastName: 'Lima',
    },
  });

  await authSignUpController(
    { email: 'another_email@scaffoldhub.io', password: '12345678' },
    await testContext({}),
  );
  await prisma.user.updateMany({ data: { emailVerified: true } });
}

async function inviteNewUser() {
  await authSignUpController(
    { email: 'felipe@scaffoldhub.io', password: '12345678' },
    await testContext({}),
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

  const currentTenant = await prisma.tenant.findFirstOrThrow();

  await membershipCreate(
    { email: 'new_user@scaffoldhub.io', roles: [roles.custom] },
    await testContext({
      currentUserId: user.id,
      currentTenantId: currentTenant.id,
    }),
  );

  await prisma.membership.updateMany({
    where: {
      firstName: null,
    },
    data: {
      firstName: 'New User',
      lastName: 'New User',
      invitationToken: 'token',
    },
  });
}

test.beforeEach(async ({ page }) => {
  await testCleanupDatabase();
});

test('already signed in accept invitation', async ({ page }) => {
  await inviteExistingUser();

  await page.goto('/auth/sign-in');

  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill('felipe@scaffoldhub.io');

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('12345678');

  const button = page.getByText(dictionary.auth.signIn.button);
  await button.click();

  await page.waitForURL('/auth/tenant');

  await page.goto('/auth/invitation?token=token&email=felipe@scaffoldhub.io');
  await page.waitForURL('/');
});

test('if different email from invitation, ask if want to accept first', async ({
  page,
}) => {
  await inviteExistingUser();

  await page.goto('/auth/sign-in');

  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill('another_email@scaffoldhub.io');

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('12345678');

  const button = page.getByText(dictionary.auth.signIn.button);
  await button.click();

  await page.waitForURL('/auth/tenant');

  await page.goto('/auth/invitation?token=token&email=felipe@scaffoldhub.io');

  const buttonAcceptWrongEmail = page.getByText(
    dictionary.auth.invitation.acceptWrongEmail,
  );
  await buttonAcceptWrongEmail.click();

  await page.waitForURL('/');
});

test('reject invalid token', async ({ page }) => {
  await inviteExistingUser();

  await page.goto('/auth/sign-in');

  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill('felipe@scaffoldhub.io');

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('12345678');

  const button = page.getByText(dictionary.auth.signIn.button);
  await button.click();

  await page.waitForURL('/auth/tenant');

  await page.goto('/auth/invitation?token=WRONG_TOKEN');
  await expect(page.getByTestId('error')).toHaveText(
    dictionary.auth.invitation.invalidToken,
  );
});

test('new user require sign-up', async ({ page }) => {
  await inviteNewUser();

  await page.goto('/auth/invitation?token=token&email=felipe@scaffoldhub.io');
  await page.waitForURL(
    `/auth/sign-up?invitationToken=token&email=${encodeURIComponent(
      'felipe@scaffoldhub.io',
    )}`,
  );

  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill('new_user@scaffoldhub.io');

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('12345678');

  const button = page.getByText(dictionary.auth.signUp.button);
  await button.click();

  await page.waitForURL('/');

  await page.waitForSelector('[data-testid="tenant-switcher-button-desktop"]');

  expect(
    await page.getByTestId('tenant-switcher-button-desktop').textContent(),
  ).toContain('ScaffoldHub');
});
