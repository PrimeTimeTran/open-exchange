import { expect, Page, test } from '@playwright/test';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { membershipCreateController } from 'src/features/membership/controllers/membershipCreateController';
import { roles } from 'src/features/roles';
import { tenantCreateController } from 'src/features/tenant/controllers/tenantCreateController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import testCleanupDatabase from 'src/shared/test/testCleanDatabase';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';

async function signIn(page: Page) {
  await authSignUpController(
    { email: 'felipe@scaffoldhub.io', password: '12345678' },
    await testContext(),
  );

  const prisma = await prismaDangerouslyBypassAuth();
  await prisma.user.updateMany({ data: { emailVerified: true } });

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

if (process.env.NEXT_PUBLIC_TENANT_MODE === 'multi') {
  test('skip if only one active tenant', async ({ page }) => {
    await signIn(page);
    await page.waitForURL('/auth/tenant');

    const prisma = await prismaDangerouslyBypassAuth();
    const currentUser = await prisma.user.findFirstOrThrow();
    await tenantCreateController(
      { name: 'ScaffoldHub' },
      await testContext({ currentUserId: currentUser.id }),
    );

    await page.goto('/auth/tenant');
    await page.waitForURL('/auth/profile-onboard');
    await expect(page.url().endsWith('/auth/profile-onboard')).toBeTruthy();
  });

  test('allow to select active tenant', async ({ page }) => {
    await signIn(page);
    await page.waitForURL('/auth/tenant');

    const prisma = await prismaDangerouslyBypassAuth();
    const currentUser = await prisma.user.findFirstOrThrow();
    await tenantCreateController(
      { name: 'ScaffoldHub' },
      await testContext({ currentUserId: currentUser.id }),
    );

    await tenantCreateController(
      { name: 'ScaffoldHub (2)' },
      await testContext({ currentUserId: currentUser.id }),
    );

    await page.goto('/auth/tenant');

    await page.selectOption('select', {
      label: 'ScaffoldHub (2)',
    });

    const button = page.getByText(dictionary.auth.tenant.select.select);
    await button.click();

    await page.waitForURL('/auth/profile-onboard');
    await expect(page.url().endsWith('/auth/profile-onboard')).toBeTruthy();
  });

  test('allow to accept invitation', async ({ page }) => {
    await authSignUpController(
      { email: 'admin@scaffoldhub.io', password: 'admin_user' },
      await testContext(),
    );
    const prisma = await prismaDangerouslyBypassAuth();
    await prisma.user.updateMany({ data: { emailVerified: true } });
    const user = await prisma.user.findFirstOrThrow();

    await tenantCreateController(
      { name: 'ScaffoldHub from Invitation' },
      await testContext({ currentUserId: user.id }),
    );

    const tenant = await prisma.tenant.findFirstOrThrow();

    await membershipCreateController(
      { email: 'felipe@scaffoldhub.io', roles: [roles.admin] },
      await testContext({ currentUserId: user.id, currentTenantId: tenant.id }),
    );

    await signIn(page);

    await page.goto('/auth/tenant');

    await page.selectOption('select', {
      label: 'ScaffoldHub from Invitation',
    });

    const button = page.getByText(
      dictionary.auth.tenant.select.acceptInvitation,
    );
    await button.click();

    await page.waitForURL('/auth/profile-onboard');
    await expect(page.url().endsWith('/auth/profile-onboard')).toBeTruthy();
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
