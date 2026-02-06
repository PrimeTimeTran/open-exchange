import { expect, Page, test } from '@playwright/test';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { membershipCreate } from 'src/features/membership/controllers/membershipCreateController';
import { permissions } from 'src/features/permissions';
import { roles } from 'src/features/roles';
import { tenantCreateController } from 'src/features/tenant/controllers/tenantCreateController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import testCleanupDatabase from 'src/shared/test/testCleanDatabase';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';

const prisma = prismaDangerouslyBypassAuth();

async function setupApiKeysForTest() {
  await authSignUpController(
    { email: 'admin@scaffoldhub.io', password: '12345678' },
    await testContext(),
  );

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
    data: { firstName: 'Felipe', lastName: 'Lima' },
  });

  const admin = await prisma.membership.findFirstOrThrow({});

  const tenant = await prisma.tenant.findFirstOrThrow();

  const other = await membershipCreate(
    { email: 'other@scaffoldhub.io', roles: [roles.custom] },
    await testContext({ currentUserId: user.id, currentTenantId: tenant.id }),
  );

  await authSignUpController(
    { email: 'other@scaffoldhub.io', password: '12345678' },
    await testContext(),
  );

  await prisma.user.updateMany({ data: { emailVerified: true } });

  await prisma.membership.update({
    where: {
      id: other?.id,
    },
    data: {
      firstName: 'Other',
      lastName: 'Other',
      invitationToken: null,
    },
  });

  await prisma.apiKey.create({
    data: {
      name: 'Admin API Key',
      secret: 'secret1',
      keyPrefix: 'admin',
      tenant: {
        connect: {
          id: tenant.id,
        },
      },
      scopes: [
        permissions.membershipCreate.id,
        permissions.membershipUpdate.id,
      ],
      membership: {
        connect: {
          id: admin.id,
        },
      },
    },
  });

  await prisma.apiKey.create({
    data: {
      name: 'Other API Key',
      secret: 'secret2',
      keyPrefix: 'other',
      scopes: [permissions.membershipAutocomplete.id],
      membership: {
        connect: {
          id: other!.id,
        },
      },
      tenant: {
        connect: {
          id: tenant.id,
        },
      },
    },
  });
}

async function goToApiKeys(page: Page, email: string) {
  await page.goto('/auth/sign-in');

  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill(email);

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('12345678');

  const signInButton = page.getByText(dictionary.auth.signIn.button);
  await signInButton.click();

  await page.waitForURL('/');
  await page.goto('/api-key');
  await page.waitForURL('/api-key');
  await expect(page.getByText('Other').first()).toBeVisible();
}

test.beforeEach(async () => {
  await testCleanupDatabase();
  await setupApiKeysForTest();
});

test('admin - lists from all members', async ({ page }) => {
  await goToApiKeys(page, 'admin@scaffoldhub.io');

  const allRows = await page.locator('tbody tr').all();
  expect(allRows.length).toBe(2);
});

test('admin - deletes from any member', async ({ page }) => {
  await goToApiKeys(page, 'admin@scaffoldhub.io');

  const apiKey = await prisma.apiKey.findFirstOrThrow({
    where: {
      name: 'Other API Key',
    },
  });

  const button = page.getByTestId(`api-key-actions-${apiKey.id}`);
  await button.click();

  const deleteButton = page.getByTestId(`api-key-actions-${apiKey.id}-destroy`);
  await deleteButton.click();

  const confirmButton = page.getByTestId(`destroy-dialog-confirm`);
  await confirmButton.click();

  while ((await page.locator('tbody tr').all()).length !== 1) {
    await page.waitForTimeout(100);
  }

  await expect(
    page.getByText(dictionary.apiKey.destroy.success).first(),
  ).toBeVisible();
});

test('admin - show activity', async ({ page }) => {
  await goToApiKeys(page, 'admin@scaffoldhub.io');

  const apiKey = await prisma.apiKey.findFirstOrThrow({
    where: {
      name: 'Other API Key',
    },
  });

  const button = page.getByTestId(`api-key-actions-${apiKey.id}`);
  await button.click();

  const showActivityButton = page.getByTestId(
    `api-key-actions-${apiKey.id}-show-activity`,
  );

  await showActivityButton.click();

  while (!(await page.url()).includes('/audit-log')) {
    await page.waitForTimeout(100);
  }

  await expect(page.url()).toContain(`/audit-log`);
});

test('other - lists from self', async ({ page }) => {
  await goToApiKeys(page, 'other@scaffoldhub.io');

  const allRows = await page.locator('tbody tr').all();
  expect(allRows.length).toBe(1);
});

test('other - deletes from self', async ({ page }) => {
  await goToApiKeys(page, 'other@scaffoldhub.io');

  const apiKey = await prisma.apiKey.findFirstOrThrow({
    where: {
      name: 'Other API Key',
    },
  });

  const button = page.getByTestId(`api-key-actions-${apiKey.id}`);
  await button.click();

  const deleteButton = page.getByTestId(`api-key-actions-${apiKey.id}-destroy`);
  await deleteButton.click();

  const confirmButton = page.getByTestId(`destroy-dialog-confirm`);
  await confirmButton.click();

  while ((await page.locator('tbody tr').all()).length !== 1) {
    await page.waitForTimeout(100);
  }

  await expect(
    page.getByText(dictionary.apiKey.destroy.success).first(),
  ).toBeVisible();
});
