import { expect, Page, test } from '@playwright/test';
import dayjs from 'dayjs';
import { auditLogOperations } from 'src/features/auditLog/auditLogOperations';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { permissions } from 'src/features/permissions';
import { roles } from 'src/features/roles';
import { tenantCreateController } from 'src/features/tenant/controllers/tenantCreateController';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import testCleanupDatabase from 'src/shared/test/testCleanDatabase';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';
import { v4 as uuid } from 'uuid';

const prisma = prismaDangerouslyBypassAuth();

async function setupForTest() {
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
    data: { firstName: 'Felipe', lastName: 'Lima', fullName: 'Felipe Lima' },
  });

  const currentTenant = await prisma.tenant.findFirstOrThrow();
  const currentMembership = await prisma.membership.findFirstOrThrow();

  await prisma.apiKey.create({
    data: {
      name: 'Admin API Key',
      secret: 'secret1',
      keyPrefix: 'admin',
      tenant: {
        connect: {
          id: currentTenant.id,
        },
      },
      scopes: [
        permissions.membershipCreate.id,
        permissions.membershipUpdate.id,
      ],
      membership: {
        connect: {
          id: currentMembership.id,
        },
      },
    },
  });
}

async function goToAuditLogs(page: Page) {
  await page.goto('/auth/sign-in');

  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill('felipe@scaffoldhub.io');

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('12345678');

  const signInButton = page.getByText(dictionary.auth.signIn.button);
  await signInButton.click();

  await page.waitForURL('/');

  const currentTenant = await prisma.tenant.findFirstOrThrow();
  const currentMembership = await prisma.membership.findFirstOrThrow();
  const currentApiKey = await prisma.apiKey.findFirstOrThrow();

  // Clean all logs for a fresh test
  await prisma.auditLog.deleteMany();

  await prisma.auditLog.create({
    data: {
      timestamp: dayjs().subtract(1, 'year').toDate(),
      membershipId: currentMembership.id,
      entityName: 'Entity A',
      entityId: uuid(),
      operation: auditLogOperations.signIn,
      transactionId: 1,
      apiKeyId: currentApiKey.id,
      apiEndpoint: '/api/test',
      apiHttpResponseCode: '200',
      tenantId: currentTenant.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      timestamp: new Date(),
      entityName: 'Entity B',
      entityId: uuid(),
      operation: auditLogOperations.update,
      transactionId: 2,
      tenantId: currentTenant.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      timestamp: new Date(),
      entityName: 'Entity C',
      entityId: uuid(),
      operation: auditLogOperations.delete,
      transactionId: 3,
      tenantId: uuid(),
    },
  });

  await page.goto('/audit-log');
  await page.waitForURL('/audit-log');
  await expect(page.getByText('Entity A')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await testCleanupDatabase();
  await setupForTest();
  await goToAuditLogs(page);
});

test('lists audit logs', async ({ page }) => {
  const allRows = await page.locator('tbody tr').all();
  expect(allRows.length).toBe(2);
});

test('filter by timestamp', async ({ page }) => {
  const filters = page.getByText(dictionary.shared.dataTable.filters);
  await filters.click();

  const startInput = page.locator('input[placeholder="Start date"]').first();
  await startInput.focus();
  await startInput.fill(
    dayjs()
      .subtract(1, 'year')
      .subtract(1, 'day')
      .format('YYYY-MM-DDTHH:mm:ss'),
  );
  const endInput = page.locator('input[placeholder="End date"]').last();
  await endInput.focus();
  await endInput.fill(
    dayjs().subtract(1, 'year').add(1, 'day').format('YYYY-MM-DDTHH:mm:ss'),
  );

  const button = page.getByText(dictionary.shared.search);
  await button.click();

  while ((await page.locator('tbody tr').all()).length !== 1) {
    await page.waitForTimeout(100);
  }

  const firstRow = page.locator('tbody tr:nth-child(1)');
  while (!(await firstRow.textContent())?.includes('Entity A')) {
    await page.waitForTimeout(100);
  }
});

test('filter by operation', async ({ page }) => {
  const filters = page.getByText(dictionary.shared.dataTable.filters);
  await filters.click();

  const input = page.getByTestId('operations');
  await input.click();

  await page
    .getByTestId(`operations-option-${auditLogOperations.signIn}`)
    .click();

  const button = page.getByText(dictionary.shared.search);
  await button.click();

  while ((await page.locator('tbody tr').all()).length !== 1) {
    await page.waitForTimeout(100);
  }

  const firstRow = page.locator('tbody tr:nth-child(1)');
  while (
    !(await firstRow.textContent())?.includes(
      dictionary.auditLog.enumerators.operation.SI,
    )
  ) {
    await page.waitForTimeout(100);
  }
});

test('filter by membership', async ({ page }) => {
  const filters = page.getByText(dictionary.shared.dataTable.filters);
  await filters.click();

  const input = page.getByTestId('membership');
  await input.click();

  const currentMembership = await prisma.membership.findFirstOrThrow();

  await page.getByTestId(`membership-option-${currentMembership.id}`).click();

  const button = page.getByText(dictionary.shared.search);
  await button.click();

  while ((await page.locator('tbody tr').all()).length !== 1) {
    await page.waitForTimeout(100);
  }

  const firstRow = page.locator('tbody tr:nth-child(1)');
  while (
    !(await firstRow.textContent())?.includes(currentMembership.fullName!)
  ) {
    await page.waitForTimeout(100);
  }
});

test('filter by api key', async ({ page }) => {
  const filters = page.getByText(dictionary.shared.dataTable.filters);
  await filters.click();

  const input = page.getByTestId('apiKey');
  await input.click();

  const currentApiKey = await prisma.apiKey.findFirstOrThrow();

  await page.getByTestId(`apiKey-option-${currentApiKey.id}`).click();

  const button = page.getByText(dictionary.shared.search);
  await button.click();

  while ((await page.locator('tbody tr').all()).length !== 1) {
    await page.waitForTimeout(100);
  }

  const firstRow = page.locator('tbody tr:nth-child(1)');
  while (!(await firstRow.textContent())?.includes('Admin API Key')) {
    await page.waitForTimeout(100);
  }
});

test('filter entity id', async ({ page }) => {
  const filters = page.getByText(dictionary.shared.dataTable.filters);
  await filters.click();

  const auditLog = await prisma.auditLog.findFirstOrThrow();

  const input = page.locator('input[name="entityId"]');
  await input.fill(auditLog.entityId);

  const button = page.getByText(dictionary.shared.search);
  await button.click();

  while ((await page.locator('tbody tr').all()).length !== 1) {
    await page.waitForTimeout(100);
  }

  const firstRow = page.locator('tbody tr:nth-child(1)');
  while (!(await firstRow.textContent())?.includes(auditLog.entityId)) {
    await page.waitForTimeout(100);
  }
});

test('filter entity name', async ({ page }) => {
  const filters = page.getByText(dictionary.shared.dataTable.filters);
  await filters.click();

  const input = page.getByTestId('entityNames');
  await input.fill('Entity B');
  await input.blur();

  const button = page.getByText(dictionary.shared.search);
  await button.click();

  while ((await page.locator('tbody tr').all()).length !== 1) {
    await page.waitForTimeout(100);
  }

  const firstRow = page.locator('tbody tr:nth-child(1)');
  while (!(await firstRow.textContent())?.includes('Entity B')) {
    await page.waitForTimeout(100);
  }
});

test('filter transaction id', async ({ page }) => {
  const filters = page.getByText(dictionary.shared.dataTable.filters);
  await filters.click();

  const input = page.locator('input[name="transactionId"]');
  await input.fill('1');

  const button = page.getByText(dictionary.shared.search);
  await button.click();

  while ((await page.locator('tbody tr').all()).length !== 1) {
    await page.waitForTimeout(100);
  }

  const firstRow = page.locator('tbody tr:nth-child(1)');
  while (!(await firstRow.textContent())?.includes('Entity A')) {
    await page.waitForTimeout(100);
  }
});

test('filter http response', async ({ page }) => {
  const filters = page.getByText(dictionary.shared.dataTable.filters);
  await filters.click();

  const input = page.locator('input[name="apiHttpResponseCode"]');
  await input.fill('200');

  const button = page.getByText(dictionary.shared.search);
  await button.click();

  while ((await page.locator('tbody tr').all()).length !== 1) {
    await page.waitForTimeout(100);
  }

  const firstRow = page.locator('tbody tr:nth-child(1)');
  while (!(await firstRow.textContent())?.includes('Entity A')) {
    await page.waitForTimeout(100);
  }
});

test('filter api endpoint', async ({ page }) => {
  const filters = page.getByText(dictionary.shared.dataTable.filters);
  await filters.click();

  const input = page.locator('input[name="apiEndpoint"]');
  await input.fill('test');

  const button = page.getByText(dictionary.shared.search);
  await button.click();

  while ((await page.locator('tbody tr').all()).length !== 1) {
    await page.waitForTimeout(100);
  }

  const firstRow = page.locator('tbody tr:nth-child(1)');
  while (!(await firstRow.textContent())?.includes('/api/test')) {
    await page.waitForTimeout(100);
  }
});

test('sort by timestamp', async ({ page }) => {
  const header = page
    .locator('thead')
    .getByText(dictionary.auditLog.fields.timestamp);
  await header.click();

  const allRows = await page.locator('tbody tr').all();
  expect(allRows.length).toBe(2);

  // Asc
  const ascButton = await page.getByText(
    dictionary.shared.dataTable.sortAscending,
  );
  await ascButton.click();

  const firstRow = page.locator('tbody tr:nth-child(1)');

  while (!(await firstRow.textContent())?.includes('Entity A')) {
    await page.waitForTimeout(100);
  }

  // Desc
  await header.click();

  const descButton = await page.getByText(
    dictionary.shared.dataTable.sortDescending,
  );
  await descButton.click();

  while (!(await firstRow.textContent())?.includes('Entity B')) {
    await page.waitForTimeout(100);
  }
});

test('sort by transactionId', async ({ page }) => {
  const header = page
    .locator('thead')
    .getByText(dictionary.auditLog.fields.transactionId);
  await header.click();

  const allRows = await page.locator('tbody tr').all();
  expect(allRows.length).toBe(2);

  // Asc
  const ascButton = await page.getByText(
    dictionary.shared.dataTable.sortAscending,
  );
  await ascButton.click();

  const firstRow = page.locator('tbody tr:nth-child(1)');

  while (!(await firstRow.textContent())?.includes('Entity A')) {
    await page.waitForTimeout(100);
  }

  // Desc
  await header.click();

  const descButton = await page.getByText(
    dictionary.shared.dataTable.sortDescending,
  );
  await descButton.click();

  while (!(await firstRow.textContent())?.includes('Entity B')) {
    await page.waitForTimeout(100);
  }
});

test('sort by entity name', async ({ page }) => {
  const header = page
    .locator('thead')
    .getByText(dictionary.auditLog.fields.entityName, { exact: true });
  await header.click();

  const allRows = await page.locator('tbody tr').all();
  expect(allRows.length).toBe(2);

  // Asc
  const ascButton = await page.getByText(
    dictionary.shared.dataTable.sortAscending,
  );
  await ascButton.click();

  const firstRow = page.locator('tbody tr:nth-child(1)');

  while (!(await firstRow.textContent())?.includes('Entity A')) {
    await page.waitForTimeout(100);
  }

  // Desc
  await header.click();

  const descButton = await page.getByText(
    dictionary.shared.dataTable.sortDescending,
  );
  await descButton.click();

  while (!(await firstRow.textContent())?.includes('Entity B')) {
    await page.waitForTimeout(100);
  }
});

test('sort by operation', async ({ page }) => {
  const header = page
    .locator('thead')
    .getByText(dictionary.auditLog.fields.operation);
  await header.click();

  const allRows = await page.locator('tbody tr').all();
  expect(allRows.length).toBe(2);

  // Asc
  const ascButton = await page.getByText(
    dictionary.shared.dataTable.sortAscending,
  );
  await ascButton.click();

  const firstRow = page.locator('tbody tr:nth-child(1)');

  while (!(await firstRow.textContent())?.includes('Entity A')) {
    await page.waitForTimeout(100);
  }

  // Desc
  await header.click();

  const descButton = await page.getByText(
    dictionary.shared.dataTable.sortDescending,
  );
  await descButton.click();

  while (!(await firstRow.textContent())?.includes('Entity B')) {
    await page.waitForTimeout(100);
  }
});
