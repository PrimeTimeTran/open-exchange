import { expect, Page, test } from '@playwright/test';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { tenantCreateController } from 'src/features/tenant/controllers/tenantCreateController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import testCleanupDatabase from 'src/shared/test/testCleanDatabase';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';
import { formatTranslation } from 'src/translation/formatTranslation';

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
        name: 'Acme Corp',
      },
      await testContext({ currentUserId: user.id }),
    );
  } catch (error) {
    // skip, may be single tenant
  }
  await prisma.membership.updateMany({
    data: { firstName: 'Felipe', lastName: 'Lima' },
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

test('shows membership count', async ({ page }) => {
  await signIn(page);
  await page.waitForSelector('[data-testid="membershipDashboardCard-count"]');
  const count = page.getByTestId('membershipDashboardCard-count');
  expect(await count.textContent()).toBe('1');
});

test('shows recent activity', async ({ page }) => {
  await signIn(page);
  const text = `${formatTranslation(
    dictionary.auditLog.readableOperations.SI,
    `Felipe Lima`,
    null,
    null,
  ).trim()}.`;
  const element = page.getByText(text);
  expect(await element.textContent()).toBe(text);
});
