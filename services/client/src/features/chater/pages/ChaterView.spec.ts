import { Page, test } from '@playwright/test';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
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

async function goToChaterView(page: Page) {
  await page.goto('/auth/sign-in');

  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill('felipe@scaffoldhub.io');

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('12345678');

  const signInButton = page.getByText(dictionary.auth.signIn.button);
  await signInButton.click();

  const chater = await prisma.chater.findFirstOrThrow();

  // TODO: Create chater here
  // await prisma.chater.create({});

  await page.waitForURL('/');
  await page.goto(`/chater/${chater.id}`);
  await page.waitForURL(`/chater/${chater.id}`);
}

test.beforeEach(async ({ page }) => {
  await testCleanupDatabase();
  await setupAdminForTest();
  await goToChaterView(page);
});

test.skip('renders page', async ({ page }) => {});

// TODO: Implement more tests
