import { test } from '@playwright/test';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import testCleanupDatabase from 'src/shared/test/testCleanDatabase';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';

test.beforeEach(async ({ page }) => {
  await testCleanupDatabase();
});

test('if single tenant, users with no roles (permissions) are locked', async ({
  page,
}) => {
  if (process.env.NEXT_PUBLIC_TENANT_MODE === 'multi') {
    // Not valid for multi tenant
    return;
  }

  await authSignUpController(
    { email: 'felipe@scaffoldhub.io', password: '12345678' },
    await testContext(),
  );

  const prisma = await prismaDangerouslyBypassAuth();
  await prisma.user.updateMany({ data: { emailVerified: true } });
  // Remove user permission
  await prisma.membership.updateMany({ data: { roles: [] } });

  await page.goto('/auth/sign-in');

  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill('felipe@scaffoldhub.io');

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('12345678');

  const button = page.getByText(dictionary.auth.signIn.button);
  await button.click();

  await page.waitForURL('/auth/no-permissions');
});
