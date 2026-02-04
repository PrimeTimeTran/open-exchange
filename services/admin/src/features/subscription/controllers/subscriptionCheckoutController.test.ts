import { Tenant } from '@prisma/client';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { roles } from 'src/features/roles';
import { subscriptionCheckoutController } from 'src/features/subscription/controllers/subscriptionCheckoutController';
import { subscriptionStatuses } from 'src/features/subscription/subscriptionStatuses';
import { tenantCreateController } from 'src/features/tenant/controllers/tenantCreateController';
import { UserWithMemberships } from 'src/features/user/userSchemas';
import { prismaAuth, prismaDangerouslyBypassAuth } from 'src/prisma';
import Error403 from 'src/shared/errors/Error403';
import { testContext } from 'src/shared/test/testContext';
import dictionary from 'src/translation/en/en';

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
      checkout: {
        sessions: {
          create: jest.fn().mockResolvedValue({ id: 'session-id' }),
        },
      },
    };
  });
});

describe('subscriptionCheckout', () => {
  let currentUser: UserWithMemberships;
  let currentTenant: Tenant;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_TENANT_MODE = 'multi';

    process.env.NEXT_PUBLIC_SUBSCRIPTION_PRICES_BASIC = 'basic';
    process.env.NEXT_PUBLIC_SUBSCRIPTION_PRICES_ENTERPRISE =
      'enterprise';
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

  describe('subscription mode membership', () => {
    beforeAll(() => {
      process.env.NEXT_PUBLIC_SUBSCRIPTION_MODE = 'membership';
    });

    it('returns the stripe session', async () => {
      const { sessionId } = await subscriptionCheckoutController(
        {
          stripePriceId: 'basic',
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );

      expect(sessionId).toBe('session-id');
    });

    it('creates stripe customer', async () => {
      mockStripeCustomersCreate.mockClear();

      await subscriptionCheckoutController(
        {
          stripePriceId: 'basic',
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );

      expect(mockStripeCustomersCreate).toHaveBeenCalledWith({
        email: currentUser.email,
        metadata: {
          tenantId: currentTenant.id,
          userId: currentUser.id,
          membershipId: currentUser?.memberships?.[0]?.id,
        },
      });
    });

    subscriptionStatuses.active.forEach((activeStatus) => {
      it(`reject if ${activeStatus} subscription exists`, async () => {
        const _prismaAuth = prismaAuth({
          currentUser,
          currentMembership: currentUser?.memberships?.[0],
          currentTenant,
        });

        await _prismaAuth.subscription.create({
          data: {
            userId: currentUser?.id,
            tenantId: currentTenant?.id,
            membershipId: currentUser?.memberships?.[0].id,
            status: activeStatus,
            stripeCustomerId: 'stripe-customer-id-1',
            stripePriceId: 'basic',
            stripeSubscriptionId: 'stripe-subscription-id-1',
            mode: 'membership',
          },
        });

        try {
          await subscriptionCheckoutController(
            {
              stripePriceId: 'basic',
            },
            await testContext({
              currentUserId: currentUser?.id,
              currentTenantId: currentTenant?.id,
            }),
          );
          fail();
        } catch (error: any) {
          expect(error.message).toBe(
            dictionary.subscription.errors.alreadyExistsActive,
          );
        }
      });
    });

    subscriptionStatuses.inactive.forEach((inactiveStatus) => {
      it(`bypass if subscription exists but it's ${inactiveStatus}`, async () => {
        await prisma.subscription.create({
          data: {
            userId: currentUser?.id,
            tenantId: currentTenant?.id,
            membershipId: currentUser?.memberships?.[0].id,
            status: inactiveStatus,
            stripeCustomerId: 'stripe-customer-id-1',
            stripePriceId: 'basic',
            stripeSubscriptionId: 'stripe-subscription-id-1',
            mode: 'membership',
          },
        });

        await subscriptionCheckoutController(
          {
            stripePriceId: 'basic',
          },
          await testContext({
            currentUserId: currentUser?.id,
            currentTenantId: currentTenant?.id,
          }),
        );
      });
    });
  });

  describe('subscription mode tenant', () => {
    beforeAll(() => {
      process.env.NEXT_PUBLIC_SUBSCRIPTION_MODE = 'tenant';
    });

    it('returns the stripe session', async () => {
      const { sessionId } = await subscriptionCheckoutController(
        {
          stripePriceId: 'basic',
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );

      expect(sessionId).toBe('session-id');
    });

    it('creates stripe customer', async () => {
      mockStripeCustomersCreate.mockClear();

      await subscriptionCheckoutController(
        {
          stripePriceId: 'basic',
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );

      expect(mockStripeCustomersCreate).toHaveBeenCalledWith({
        email: currentUser.email,
        metadata: {
          tenantId: currentTenant.id,
          userId: currentUser.id,
        },
      });
    });

    it('requires the stripePriceId', async () => {
      try {
        await subscriptionCheckoutController(
          {},
          await testContext({
            currentUserId: currentUser?.id,
            currentTenantId: currentTenant?.id,
          }),
        );
        fail();
      } catch (error: any) {
        expect(error.errors[0].message).toBe('Required');
      }
    });

    it('must have subscriptionCreate permission', async () => {
      await prisma.membership.updateMany({
        data: {
          roles: [],
        },
      });

      try {
        await subscriptionCheckoutController(
          {
            stripePriceId: 'basic',
          },
          await testContext({
            currentUserId: currentUser?.id,
            currentTenantId: currentTenant?.id,
          }),
        );
        fail();
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error403);
      }
    });

    subscriptionStatuses.active.forEach((activeStatus) => {
      it(`reject if ${activeStatus} subscription exists`, async () => {
        await prisma.subscription.create({
          data: {
            userId: currentUser?.id,
            tenantId: currentTenant?.id,
            status: activeStatus,
            stripeCustomerId: 'stripe-customer-id-1',
            stripePriceId: 'basic',
            stripeSubscriptionId: 'stripe-subscription-id-1',
            mode: 'tenant',
          },
        });

        try {
          await subscriptionCheckoutController(
            {
              stripePriceId: 'basic',
            },
            await testContext({
              currentUserId: currentUser?.id,
              currentTenantId: currentTenant?.id,
            }),
          );
          fail();
        } catch (error: any) {
          expect(error.message).toBe(
            dictionary.subscription.errors.alreadyExistsActive,
          );
        }
      });
    });

    subscriptionStatuses.inactive.forEach((inactiveStatus) => {
      it(`bypass if subscription exists but it's ${inactiveStatus}`, async () => {
        await prisma.subscription.create({
          data: {
            userId: currentUser?.id,
            tenantId: currentTenant?.id,
            status: inactiveStatus,
            stripeCustomerId: 'stripe-customer-id-1',
            stripePriceId: 'basic',
            stripeSubscriptionId: 'stripe-subscription-id-1',
            mode: 'tenant',
          },
        });

        await subscriptionCheckoutController(
          {
            stripePriceId: 'basic',
          },
          await testContext({
            currentUserId: currentUser?.id,
            currentTenantId: currentTenant?.id,
          }),
        );
      });
    });
  });

  describe('subscription mode user', () => {
    beforeAll(() => {
      process.env.NEXT_PUBLIC_SUBSCRIPTION_MODE = 'user';
    });

    it('returns the stripe session', async () => {
      const { sessionId } = await subscriptionCheckoutController(
        {
          stripePriceId: 'basic',
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );

      expect(sessionId).toBe('session-id');
    });

    it('creates stripe customer', async () => {
      mockStripeCustomersCreate.mockClear();

      await subscriptionCheckoutController(
        {
          stripePriceId: 'basic',
        },
        await testContext({
          currentUserId: currentUser?.id,
          currentTenantId: currentTenant?.id,
        }),
      );

      expect(mockStripeCustomersCreate).toHaveBeenCalledWith({
        email: currentUser.email,
        metadata: {
          userId: currentUser.id,
        },
      });
    });

    subscriptionStatuses.active.forEach((activeStatus) => {
      it(`reject if ${activeStatus} subscription exists`, async () => {
        await prisma.subscription.create({
          data: {
            userId: currentUser?.id,
            status: activeStatus,
            stripeCustomerId: 'stripe-customer-id-1',
            stripePriceId: 'basic',
            stripeSubscriptionId: 'stripe-subscription-id-1',
            mode: 'user',
          },
        });

        try {
          await subscriptionCheckoutController(
            {
              stripePriceId: 'basic',
            },
            await testContext({
              currentUserId: currentUser?.id,
              currentTenantId: currentTenant?.id,
            }),
          );
          fail();
        } catch (error: any) {
          expect(error.message).toBe(
            dictionary.subscription.errors.alreadyExistsActive,
          );
        }
      });
    });

    subscriptionStatuses.inactive.forEach((inactiveStatus) => {
      it(`bypass if subscription exists but it's ${inactiveStatus}`, async () => {
        await prisma.subscription.create({
          data: {
            userId: currentUser?.id,
            status: inactiveStatus,
            stripeCustomerId: 'stripe-customer-id-1',
            stripePriceId: 'basic',
            stripeSubscriptionId: 'stripe-subscription-id-1',
            mode: 'user',
          },
        });

        await subscriptionCheckoutController(
          {
            stripePriceId: 'basic',
          },
          await testContext({
            currentUserId: currentUser?.id,
            currentTenantId: currentTenant?.id,
          }),
        );
      });
    });
  });
});
