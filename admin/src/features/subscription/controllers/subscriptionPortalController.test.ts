import { Tenant } from '@prisma/client';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { subscriptionPortalController } from 'src/features/subscription/controllers/subscriptionPortalController';
import { subscriptionStatuses } from 'src/features/subscription/subscriptionStatuses';
import { tenantCreateController } from 'src/features/tenant/controllers/tenantCreateController';
import { UserWithMemberships } from 'src/features/user/userSchemas';
import { prismaAuth, prismaDangerouslyBypassAuth } from 'src/prisma';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';

const prisma = prismaDangerouslyBypassAuth();

const mockStripeCustomersCreate = jest
  .fn()
  .mockResolvedValue({ id: 'customer-id' });

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return {
      customers: {
        create: mockStripeCustomersCreate,
        list: jest.fn().mockResolvedValue({ data: [] }),
      },
      billingPortal: {
        sessions: {
          create: jest.fn().mockResolvedValue({ url: 'mock-url' }),
        },
      },
    };
  });
});

describe('subscriptionPortal', () => {
  let currentUser: UserWithMemberships;
  let currentTenant: Tenant;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_TENANT_MODE = 'multi';
    // The workflow is the same for any mode.
    process.env.NEXT_PUBLIC_SUBSCRIPTION_MODE = 'user';
  });

  beforeEach(async () => {
    await authSignUpController(
      {
        email: 'felipe@scaffoldhub.io',
        password: '12345678',
      },
      await testContext(),
    );

    currentUser = await prisma.user.findFirstOrThrow({
      include: { memberships: true },
    });

    await tenantCreateController(
      { name: 'ScaffoldHub' },
      await testContext({
        currentUserId: currentUser.id,
      }),
    );

    // Reload to get fresh membership
    currentUser = await prisma.user.findFirstOrThrow({
      include: { memberships: true },
    });
    currentTenant = await prisma.tenant.findFirstOrThrow();
  });

  subscriptionStatuses.active.forEach((activeStatus) => {
    it(`returns URL if ${activeStatus} subscription exists`, async () => {
      const _prismaAuth = prismaAuth({
        currentUser,
        currentMembership: currentUser?.memberships?.[0],
        currentTenant,
      });

      await _prismaAuth.subscription.create({
        data: {
          userId: currentUser?.id,
          status: activeStatus,
          stripeCustomerId: 'stripe-customer-id-1',
          stripePriceId: 'basic',
          stripeSubscriptionId: 'stripe-subscription-id-1',
          mode: 'user',
        },
      });

      const data = await subscriptionPortalController(
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );

      expect(data).toEqual({ url: 'mock-url' });
    });
  });

  subscriptionStatuses.inactive.forEach((inactiveStatus) => {
    it(`denies if subscription exists but it's ${inactiveStatus}`, async () => {
      const _prismaAuth = prismaAuth({
        currentUser,
        currentMembership: currentUser?.memberships?.[0],
        currentTenant,
      });

      await _prismaAuth.subscription.create({
        data: {
          userId: currentUser?.id,
          status: inactiveStatus,
          stripeCustomerId: 'stripe-customer-id-1',
          stripePriceId: 'basic',
          stripeSubscriptionId: 'stripe-subscription-id-1',
          mode: 'user',
        },
      });

      try {
        await subscriptionPortalController(
          await testContext({
            currentUserId: currentUser?.id,
            currentTenantId: currentTenant?.id,
          }),
        );
        fail();
      } catch (error) {
        expect(error).toBeInstanceOf(Error403);
      }
    });
  });

  it(`denies if subscription doesn't exist`, async () => {
    try {
      await subscriptionPortalController(
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );
      fail();
    } catch (error) {
      expect(error).toBeInstanceOf(Error403);
    }
  });
});
