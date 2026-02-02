import { expect, Page, test } from '@playwright/test';
import dayjs from 'dayjs';
import { startCase } from 'lodash';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { permissions } from 'src/features/permissions';
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
}

async function goToApiKeyEdit(page: Page, email: string) {
  await page.goto('/auth/sign-in');

  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill(email);

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('12345678');

  const signInButton = page.getByText(dictionary.auth.signIn.button);
  await signInButton.click();

  const apiKey = await prisma.apiKey.findFirstOrThrow();

  await page.waitForURL('/');
  await page.goto(`/api-key/${apiKey.id}/edit`);
  await page.waitForURL(`/api-key/${apiKey.id}/edit`);
}

test.beforeEach(async () => {
  await testCleanupDatabase();
  await setupApiKeysForTest();
});

test('updates', async ({ page }) => {
  await goToApiKeyEdit(page, 'admin@scaffoldhub.io');

  const nameInput = page.locator('input[name="name"]');
  await nameInput.fill('Updated');

  const expiresAtInput = page.getByTestId('expiresAt');
  await expiresAtInput.focus();
  await expiresAtInput.fill(
    dayjs().add(1, 'year').format('YYYY-MM-DDTHH:mm:ss'),
  );

  await page
    .getByTestId(`scopes-value-${permissions.membershipCreate.id}-remove`)
    .click();

  const button = page.getByText(dictionary.shared.save);
  await button.click();

  await page.waitForURL(`/api-key`);

  const firstRow = page.locator('tbody tr:nth-child(1)');

  while (!(await firstRow.textContent())?.includes('Updated')) {
    await page.waitForTimeout(100);
  }

  await expect(firstRow).toContainText('Updated');
  await expect(firstRow).toContainText(
    dayjs().add(1, 'year').format(dictionary.shared.dateFormat),
  );
  await expect(firstRow).not.toContainText(
    startCase(permissions.membershipCreate.id),
  );
});

test('disables', async ({ page }) => {
  await goToApiKeyEdit(page, 'admin@scaffoldhub.io');

  const field = page.getByText(dictionary.apiKey.fields.disabled);
  await field.click();

  const button = page.getByText(dictionary.shared.save);
  await button.click();

  await page.waitForURL(`/api-key`);

  const firstRow = page.locator('tbody tr:nth-child(1)');

  while (
    !(await firstRow.textContent())?.includes(
      dictionary.apiKey.enumerators.status.disabled,
    )
  ) {
    await page.waitForTimeout(100);
  }
});
