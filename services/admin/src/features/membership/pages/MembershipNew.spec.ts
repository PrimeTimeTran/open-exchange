import { expect, Page, test } from '@playwright/test';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { roles } from 'src/features/roles';
import { tenantCreateController } from 'src/features/tenant/controllers/tenantCreateController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import testCleanupDatabase from 'src/shared/test/testCleanDatabase';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';

const prisma = prismaDangerouslyBypassAuth();

async function setupAdminForTest() {
  await authSignUpController(
    { email: 'felipe@scaffoldhub.io', password: '12345678' },
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

async function goToMembershipForm(page: Page) {
  await page.goto('/auth/sign-in');

  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill('felipe@scaffoldhub.io');

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('12345678');

  const signInButton = page.getByText(dictionary.auth.signIn.button);
  await signInButton.click();

  await page.waitForURL('/');
  await page.goto('/membership/new');
  await page.waitForURL('/membership/new');
}

test.beforeEach(async ({ page }) => {
  await testCleanupDatabase();
  await setupAdminForTest();
  await goToMembershipForm(page);
});

test('creates membership', async ({ page }) => {
  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill('invited@scaffoldhub.io');

  const rolesInput = page.getByTestId('roles');
  await rolesInput.click();
  await page.getByTestId(`roles-option-${roles.custom}`).click();

  const button = page.getByText(dictionary.shared.save);
  await button.click();

  let membership;

  while (!membership) {
    membership = await prisma.membership.findFirst({
      where: {
        user: {
          email: 'invited@scaffoldhub.io',
        },
      },
    });

    await page.waitForTimeout(100);
  }

  await page.waitForURL(`/membership/${membership.id}`);
});

test('validate email', async ({ page }) => {
  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill('INVALID_EMAIL');

  const rolesInput = page.getByTestId('roles');
  await rolesInput.click();
  await page.getByTestId(`roles-option-${roles.custom}`).click();

  const button = page.getByText(dictionary.shared.save);
  await button.click();

  expect(page.getByTestId('email-error')).toBeVisible();
});

test('validate roles', async ({ page }) => {
  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill('felipe@scaffoldhub.io');

  const button = page.getByText(dictionary.shared.save);
  await button.click();

  expect(page.getByTestId('roles-error')).toBeVisible();
});
