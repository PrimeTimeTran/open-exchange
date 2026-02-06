import { expect, Page, test } from '@playwright/test';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
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
  const user = await prisma.user.findFirstOrThrow();

  await tenantCreateController(
    {
      name: 'Acme Corp',
    },
    await testContext({ currentUserId: user.id }),
  );

  await tenantCreateController(
    {
      name: 'ScaffoldHub',
    },
    await testContext({ currentUserId: user.id }),
  );

  await tenantCreateController(
    {
      name: 'Not Included',
    },
    await testContext({ currentUserId: user.id }),
  );

  await prisma.membership.deleteMany({
    where: {
      tenant: {
        name: 'Not Included',
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

  await page.waitForURL('/auth/tenant');

  const selectTenantButton = page.getByText(
    dictionary.auth.tenant.select.select,
  );
  await selectTenantButton.click();

  await page.waitForURL('/');
}

if (process.env.NEXT_PUBLIC_TENANT_MODE === 'multi') {
  test.beforeEach(async ({ page }) => {
    await testCleanupDatabase();
  });

  test('shows tenants that user has access to', async ({ page }) => {
    await signIn(page);

    await page.waitForSelector(
      '[data-testid="tenant-switcher-button-desktop"]',
    );
    const button = page.getByTestId('tenant-switcher-button-desktop');
    await button.click();

    const prisma = await prismaDangerouslyBypassAuth();
    const tenantsWithMembership = await prisma.tenant.findMany({
      where: {
        name: {
          not: 'Not Included',
        },
      },
    });

    for (const tenant of tenantsWithMembership) {
      const element = page.getByTestId(`tenant-switcher-item-${tenant.id}`);
      expect(await element.textContent()).toContain(tenant.name);
    }

    const tenantNotIncluded = await prisma.tenant.findFirstOrThrow({
      where: {
        name: 'Not Included',
      },
    });

    const elementForNotIncluded = page.getByTestId(
      `tenant-switcher-item-${tenantNotIncluded.id}`,
    );
    expect(await elementForNotIncluded.count()).toBe(0);
  });
}
