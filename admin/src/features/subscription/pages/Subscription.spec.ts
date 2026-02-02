import { expect, Page, test } from '@playwright/test';
import { SubscriptionStatus } from '@prisma/client';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
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
    data: { firstName: 'Felipe', lastName: 'Lima', fullName: 'Felipe Lima' },
  });
}

async function signIn(page: Page) {
  await page.goto('/auth/sign-in');

  const emailInput = page.locator('input[name="email"]');
  await emailInput.fill('admin@scaffoldhub.io');

  const passwordInput = page.locator('input[name="password"]');
  await passwordInput.fill('12345678');

  const signInButton = page.getByText(dictionary.auth.signIn.button);
  await signInButton.click();
}

test.beforeEach(async () => {
  await testCleanupDatabase();
  await setupForTest();
});

test('starts with free subscription', async ({ page }) => {
  await signIn(page);
  await page.waitForURL('/');
  await page.goto('/subscription');
  await page.waitForURL('/subscription');
  await expect(page.getByText(dictionary.subscription.title)).toBeVisible();

  const subscriptionButtons = await page
    .getByText(dictionary.subscription.subscribe)
    .all();
  expect(subscriptionButtons.length).toBe(2);
});

test('shows when the subscription will be canceled at the end of the period', async ({
  page,
}) => {
  const currentMembership = await prisma.membership.findFirstOrThrow();
  await prisma.subscription.create({
    data: {
      mode: 'tenant',
      status: SubscriptionStatus.active,
      stripeCustomerId: 'cus_123',
      stripePriceId: 'basic',
      stripeSubscriptionId: 'sub_123',
      isCancelAtEndPeriod: true,
      user: {
        connect: {
          id: currentMembership.userId,
        },
      },
      tenant: {
        connect: {
          id: currentMembership.tenantId,
        },
      },
    },
  });

  await signIn(page);
  await page.waitForURL('/');
  await page.goto('/subscription');
  await page.waitForURL('/subscription');

  await expect(
    page.getByText(dictionary.subscription.cancelAtPeriodEnd),
  ).toBeVisible();
});

test('shows manage button when is subscribed', async ({ page }) => {
  const currentMembership = await prisma.membership.findFirstOrThrow();
  await prisma.subscription.create({
    data: {
      mode: 'tenant',
      status: SubscriptionStatus.active,
      stripeCustomerId: 'cus_123',
      stripePriceId: 'basic',
      stripeSubscriptionId: 'sub_123',
      user: {
        connect: {
          id: currentMembership.userId,
        },
      },
      tenant: {
        connect: {
          id: currentMembership.tenantId,
        },
      },
    },
  });

  await signIn(page);
  await page.waitForURL('/');
  await page.goto('/subscription');
  await page.waitForURL('/subscription');

  await expect(page.getByText(dictionary.subscription.manage)).toBeVisible();
});

test('when not the user who subscribed, do not allow managing the plan', async ({
  page,
}) => {
  const anotherUser = await prisma.user.create({
    data: {
      email: 'another_user@scaffoldhub.io',
    },
  });

  const currentMembership = await prisma.membership.findFirstOrThrow();
  await prisma.subscription.create({
    data: {
      mode: 'tenant',
      status: SubscriptionStatus.active,
      stripeCustomerId: 'cus_123',
      stripePriceId: 'basic',
      stripeSubscriptionId: 'sub_123',
      user: {
        connect: {
          id: anotherUser.id,
        },
      },
      tenant: {
        connect: {
          id: currentMembership.tenantId,
        },
      },
    },
  });

  await signIn(page);
  await page.waitForURL('/');
  await page.goto('/subscription');
  await page.waitForURL('/subscription');

  await expect(page.getByText(dictionary.subscription.manage)).toBeDisabled();
});
