import { expect, Page, test } from '@playwright/test';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { roles } from 'src/features/roles';
import { tenantCreateController } from 'src/features/tenant/controllers/tenantCreateController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import testCleanupDatabase from 'src/shared/test/testCleanDatabase';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';

const prisma = prismaDangerouslyBypassAuth();

async function setupMembershipsForTest() {
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
    data: { firstName: 'Zzz', lastName: 'Zzz', fullName: 'Zzz Zzz' },
  });

  const tenant = await prisma.tenant.findFirstOrThrow();

  // Invited Membership
  await prisma.membership.create({
    data: {
      firstName: 'Aaa',
      lastName: 'Aaa',
      fullName: 'Aaa Aaa',
      tenant: {
        connect: {
          id: tenant.id,
        },
      },
      roles: [roles.custom],
      invitationToken: 'invitation token',
      user: {
        create: {
          email: 'zzz@scaffoldhub.io',
        },
      },
    },
  });

  // Disabled Membership
  await prisma.membership.create({
    data: {
      firstName: 'Fff',
      lastName: 'Fff',
      fullName: 'Fff Fff',
      roles: [],
      tenant: {
        connect: {
          id: tenant.id,
        },
      },
      user: {
        create: {
          email: 'fff@scaffoldhub.io',
        },
      },
    },
  });
}

async function goToMemberships(page: Page) {
  await page.goto('/auth/sign-in');

  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill('admin@scaffoldhub.io');

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('12345678');

  const signInButton = page.getByText(dictionary.auth.signIn.button);
  await signInButton.click();

  await page.waitForURL('/');
  await page.goto('/membership');
  await page.waitForURL('/membership');
  await expect(page.getByText('admin@scaffoldhub.io')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await testCleanupDatabase();
  await setupMembershipsForTest();
  await goToMemberships(page);
});

test('lists memberships', async ({ page }) => {
  const allRows = await page.locator('tbody tr').all();
  expect(allRows.length).toBe(3);
});

test('sort by email', async ({ page }) => {
  const header = page
    .locator('thead')
    .getByText(dictionary.membership.fields.email);
  await header.click();

  const allRows = await page.locator('tbody tr').all();
  expect(allRows.length).toBe(3);

  // Asc
  const ascButton = await page.getByText(
    dictionary.shared.dataTable.sortAscending,
  );
  await ascButton.click();

  const firstRow = page.locator('tbody tr:nth-child(1)');

  while (!(await firstRow.textContent())?.includes('admin@scaffoldhub.io')) {
    await page.waitForTimeout(100);
  }

  // Desc
  await header.click();

  const descButton = await page.getByText(
    dictionary.shared.dataTable.sortDescending,
  );
  await descButton.click();

  while (!(await firstRow.textContent())?.includes('zzz@scaffoldhub.io')) {
    await page.waitForTimeout(100);
  }
});

test('sort by fullName', async ({ page }) => {
  const header = page
    .locator('thead')
    .getByText(dictionary.membership.fields.fullName);
  await header.click();

  const allRows = await page.locator('tbody tr').all();
  expect(allRows.length).toBe(3);

  // Asc
  const ascButton = await page.getByText(
    dictionary.shared.dataTable.sortAscending,
  );
  await ascButton.click();

  const firstRow = page.locator('tbody tr:nth-child(1)');

  while (!(await firstRow.textContent())?.includes('Aaa')) {
    await page.waitForTimeout(100);
  }

  // Desc
  await header.click();

  const descButton = await page.getByText(
    dictionary.shared.dataTable.sortDescending,
  );
  await descButton.click();

  while (!(await firstRow.textContent())?.includes('Zzz')) {
    await page.waitForTimeout(100);
  }
});

test('sort by status', async ({ page }) => {
  const header = page
    .locator('thead')
    .getByText(dictionary.membership.fields.status);
  await header.click();

  const allRows = await page.locator('tbody tr').all();
  expect(allRows.length).toBe(3);

  // Asc
  const ascButton = await page.getByText(
    dictionary.shared.dataTable.sortAscending,
  );
  await ascButton.click();

  const firstRow = page.locator('tbody tr:nth-child(1)');

  while (
    !(await firstRow.textContent())?.includes(
      dictionary.membership.enumerators.status.active,
    )
  ) {
    await page.waitForTimeout(100);
  }

  // Desc
  await header.click();

  const descButton = await page.getByText(
    dictionary.shared.dataTable.sortDescending,
  );
  await descButton.click();

  while (
    !(await firstRow.textContent())?.includes(
      dictionary.membership.enumerators.status.invited,
    )
  ) {
    await page.waitForTimeout(100);
  }
});

test('filter by email', async ({ page }) => {
  const filters = page.getByText(dictionary.shared.dataTable.filters);
  await filters.click();

  const input = page.locator('input[name="email"]');
  await input.fill('admin@scaffoldhub.io');

  const button = page.getByText(dictionary.shared.search);
  await button.click();

  while ((await page.locator('tbody tr').all()).length !== 1) {
    await page.waitForTimeout(100);
  }

  const firstRow = page.locator('tbody tr:nth-child(1)');
  while (!(await firstRow.textContent())?.includes('admin@scaffoldhub.io')) {
    await page.waitForTimeout(100);
  }
});

test('filter by fullName', async ({ page }) => {
  const filters = page.getByText(dictionary.shared.dataTable.filters);
  await filters.click();

  const input = page.locator('input[name="fullName"]');
  await input.fill('Fff');

  const button = page.getByText(dictionary.shared.search);
  await button.click();

  while ((await page.locator('tbody tr').all()).length !== 1) {
    await page.waitForTimeout(100);
  }

  const firstRow = page.locator('tbody tr:nth-child(1)');
  while (!(await firstRow.textContent())?.includes('Fff')) {
    await page.waitForTimeout(100);
  }
});

test('filter by status', async ({ page }) => {
  const filters = page.getByText(dictionary.shared.dataTable.filters);
  await filters.click();

  const input = page.getByTestId('statuses');
  await input.click();

  await page.getByTestId(`statuses-option-disabled`).click();

  const button = page.getByText(dictionary.shared.search);
  await button.click();

  while ((await page.locator('tbody tr').all()).length !== 1) {
    await page.waitForTimeout(100);
  }

  const firstRow = page.locator('tbody tr:nth-child(1)');
  while (
    !(await firstRow.textContent())?.includes(
      dictionary.membership.enumerators.status.disabled,
    )
  ) {
    await page.waitForTimeout(100);
  }
});

test('filter by role', async ({ page }) => {
  const filters = page.getByText(dictionary.shared.dataTable.filters);
  await filters.click();

  const input = page.getByTestId('roles');
  await input.click();

  await page.getByTestId(`roles-option-${roles.custom}`).click();

  const button = page.getByText(dictionary.shared.search);
  await button.click();

  while ((await page.locator('tbody tr').all()).length !== 1) {
    await page.waitForTimeout(100);
  }

  const firstRow = page.locator('tbody tr:nth-child(1)');
  while (
    !(await firstRow.textContent())?.includes(
      dictionary.membership.enumerators.roles.custom,
    )
  ) {
    await page.waitForTimeout(100);
  }
});

test('deletes a membership', async ({ page }) => {
  const membership = await prisma.membership.findFirstOrThrow({
    where: {
      invitationToken: { not: null },
    },
  });

  const button = page.getByTestId(`membership-actions-${membership.id}`);
  await button.click();

  const deleteButton = page.getByTestId(
    `membership-actions-${membership.id}-destroy`,
  );
  await deleteButton.click();

  const confirmButton = page.getByTestId(`destroy-dialog-confirm`);
  await confirmButton.click();

  while ((await page.locator('tbody tr').all()).length !== 2) {
    await page.waitForTimeout(100);
  }

  await expect(
    page.getByText(dictionary.membership.destroy.success).first(),
  ).toBeVisible();
});

test('resends invitation email', async ({ page }) => {
  const membership = await prisma.membership.findFirstOrThrow({
    where: {
      invitationToken: { not: null },
    },
  });

  const button = page.getByTestId(`membership-actions-${membership.id}`);
  await button.click();

  const resendInvitationEmailButton = page.getByTestId(
    `membership-actions-${membership.id}-resend-invitation-email`,
  );
  await resendInvitationEmailButton.click();

  await expect(
    page.getByText(dictionary.membership.resendInvitationEmail.success).first(),
  ).toBeVisible();
});

test('show member activity', async ({ page }) => {
  const membership = await prisma.membership.findFirstOrThrow({
    where: {
      roles: {
        has: roles.admin,
      },
    },
  });

  const button = page.getByTestId(`membership-actions-${membership.id}`);
  await button.click();

  const showActivityButton = page.getByTestId(
    `membership-actions-${membership.id}-show-activity`,
  );
  await showActivityButton.click();

  while (!(await page.url()).includes('/audit-log')) {
    await page.waitForTimeout(100);
  }

  await expect(page.url()).toContain(`/audit-log`);
});
