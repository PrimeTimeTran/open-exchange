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
}

if (process.env.NEXT_PUBLIC_TENANT_MODE === 'multi') {
  test.beforeEach(async ({ page }) => {
    await testCleanupDatabase();
  });

  test('creates new tenant and sends to onboard', async ({ page }) => {
    await signIn(page);
    await page.waitForSelector(
      '[data-testid="tenant-switcher-button-desktop"]',
    );
    const switcherButton = page.getByTestId('tenant-switcher-button-desktop');
    await switcherButton.click();

    const popupButton = page.getByText(dictionary.tenant.switcher.create);
    await popupButton.click();

    const name = page.locator('input[name="name"]');
    await name.fill('ScaffoldHub');

    const createButton = page.getByText(dictionary.shared.save);
    await createButton.click();

    await page.waitForURL('/auth/profile-onboard');
  });

  test('updates tenant name', async ({ page }) => {
    await signIn(page);
    await page.waitForSelector(
      '[data-testid="authenticated-user-nav-button-desktop"]',
    );
    const userNavButton = page.getByTestId(
      'authenticated-user-nav-button-desktop',
    );
    await userNavButton.click();

    await page.getByText(dictionary.tenant.form.edit.title).click();
    const name = page.locator('input[name="name"]');
    await name.fill('Edited');

    const updateButton = page.getByText(dictionary.shared.save);
    await updateButton.click();

    const tenantFormDialog = page.getByTestId('tenant-form-dialog');
    await expect(tenantFormDialog).toHaveCount(0);

    await page.waitForSelector(
      '[data-testid="tenant-switcher-button-desktop"]',
    );

    while (
      (await page
        .getByTestId('tenant-switcher-button-desktop')
        .textContent()) !== 'Edited'
    ) {
      await page.waitForTimeout(100);
    }
    expect(
      await page.getByTestId('tenant-switcher-button-desktop').textContent(),
    ).toContain('Edited');
  });

  test('deletes tenant', async ({ page }) => {
    await signIn(page);
    await page.waitForSelector(
      '[data-testid="authenticated-user-nav-button-desktop"]',
    );
    const userNavButton = page.getByTestId(
      'authenticated-user-nav-button-desktop',
    );
    await userNavButton.click();

    await page.getByText(dictionary.tenant.form.edit.title).click();

    await page.getByText(dictionary.shared.delete).click();
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: dictionary.shared.delete }).click();
    await page.waitForURL('/auth/tenant');
  });
}
