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

async function setupForTest() {
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
}

async function goToApiKeyNew(page: Page, email: string) {
  await page.goto('/auth/sign-in');

  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill(email);

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('12345678');

  const signInButton = page.getByText(dictionary.auth.signIn.button);
  await signInButton.click();

  await page.waitForURL('/');
  await page.goto(`/api-key/new`);
  await page.waitForURL(`/api-key/new`);
}

test.beforeEach(async () => {
  await testCleanupDatabase();
  await setupForTest();
});

test('creates and shows API Key one time', async ({ page }) => {
  await goToApiKeyNew(page, 'admin@scaffoldhub.io');

  const nameInput = page.locator('input[name="name"]');
  await nameInput.fill('Admin API Key');

  const expiresAtInput = page.getByTestId('expiresAt');
  await expiresAtInput.fill(
    dayjs().add(1, 'year').format('YYYY-MM-DDTHH:mm:ss'),
  );

  await page.getByTestId(`scopes`).click();
  await page
    .getByTestId(`scopes-option-${permissions.membershipCreate.id}`)
    .click();

  const button = page.getByText(dictionary.shared.save);
  await button.click();

  let apiKey = await prisma.apiKey.findFirst();
  while (!apiKey) {
    apiKey = await prisma.apiKey.findFirst();
    page.waitForTimeout(100);
  }

  await page.waitForSelector(`[data-testid="api-key-secret"]`);

  await expect(page.getByTestId('api-key-secret')).toContainText(
    apiKey.keyPrefix,
  );
});
