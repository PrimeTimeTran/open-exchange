import { Page, expect, test } from '@playwright/test';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { tenantCreateController } from 'src/features/tenant/controllers/tenantCreateController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import testCleanupDatabase from 'src/shared/test/testCleanDatabase';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';

async function signInAndOpenInvitationDialog(page: Page) {
  await authSignUpController(
    { email: 'felipe@scaffoldhub.io', password: '12345678' },
    await testContext(),
  );

  const prisma = await prismaDangerouslyBypassAuth();
  await prisma.user.updateMany({ data: { emailVerified: true } });
  const user = await prisma.user.findFirstOrThrow();

  await tenantCreateController(
    {
      name: 'Acme Corp',
    },
    await testContext({ currentUserId: user.id }),
  );

  await tenantCreateController(
    {
      name: 'Invited',
    },
    await testContext({ currentUserId: user.id }),
  );

  await prisma.membership.updateMany({
    data: {
      invitationToken: 'token',
    },
    where: {
      tenant: {
        name: 'Invited',
      },
    },
  });

  await prisma.membership.updateMany({
    data: { firstName: 'Felipe', lastName: 'Lima' },
  });

  await page.goto('/auth/sign-in');

  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill('felipe@scaffoldhub.io');

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('12345678');

  const signInButton = page.getByText(dictionary.auth.signIn.button);
  await signInButton.click();

  await page.waitForURL('/');

  await page.waitForSelector('[data-testid="tenant-switcher-button-desktop"]');
  const button = page.getByTestId('tenant-switcher-button-desktop');
  await button.click();

  const invitedTenant = await prisma.tenant.findFirstOrThrow({
    where: {
      name: 'Invited',
    },
  });
  const element = page.getByTestId(`tenant-switcher-item-${invitedTenant.id}`);
  await element.click();
}

if (process.env.NEXT_PUBLIC_TENANT_MODE === 'multi') {
  test.beforeEach(async ({ page }) => {
    await testCleanupDatabase();
  });

  test('accept invitation', async ({ page }) => {
    await signInAndOpenInvitationDialog(page);
    const acceptButton = page.getByRole('button', {
      name: dictionary.shared.accept,
    });
    await acceptButton.click();

    await page.waitForURL('/');
  });

  test('decline invitation', async ({ page }) => {
    await signInAndOpenInvitationDialog(page);
    const declineButton = page.getByRole('button', {
      name: dictionary.shared.decline,
    });
    await declineButton.click();

    await expect(declineButton).toHaveCount(0, { timeout: 20000 });

    const prisma = await prismaDangerouslyBypassAuth();

    const currentTenant = await prisma.tenant.findFirstOrThrow({
      where: {
        name: 'Acme Corp',
      },
    });

    const invitedTenant = await prisma.tenant.findFirstOrThrow({
      where: {
        name: 'Invited',
      },
    });

    await page.waitForTimeout(2000);

    const button = page.getByTestId('tenant-switcher-button-desktop');
    await button.click();

    const currentTenantElement = page.getByTestId(
      `tenant-switcher-item-${currentTenant.id}`,
    );
    expect(currentTenantElement).toHaveCount(1);

    const invitedTenantElement = page.getByTestId(
      `tenant-switcher-item-${invitedTenant.id}`,
    );
    expect(invitedTenantElement).toHaveCount(0);
  });
}
