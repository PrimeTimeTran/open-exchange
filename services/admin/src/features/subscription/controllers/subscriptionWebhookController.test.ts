import { SubscriptionMode, SubscriptionStatus, Tenant } from '@prisma/client';
import { authSignUpController } from 'src/features/auth/controllers/authSignUpController';
import { subscriptionWebhookController } from 'src/features/subscription/controllers/subscriptionWebhookController';
import { tenantCreateController } from 'src/features/tenant/controllers/tenantCreateController';
import { UserWithMemberships } from 'src/features/user/userSchemas';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import { testContext } from 'src/shared/test/testContext';

const prisma = prismaDangerouslyBypassAuth();

const mockStripeWebhookContructEvent = jest.fn();
const mockStripeCheckoutSessionRetrieve = jest.fn();

const mockStripeCustomersCreate = jest
  .fn()
  .mockResolvedValue({ id: 'customer-id' });

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return {
      checkout: {
        sessions: {
          retrieve: mockStripeCheckoutSessionRetrieve,
        },
      },
      webhooks: {
        constructEvent: mockStripeWebhookContructEvent,
      },
      customers: {
        create: mockStripeCustomersCreate,
        list: jest.fn().mockResolvedValue({ data: [] }),
      },
    };
  });
});

describe('subscriptionWebhook', () => {
  let currentUser: UserWithMemberships;
  let currentTenant: Tenant;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_TENANT_MODE = 'multi';
    process.env.NEXT_PUBLIC_SUBSCRIPTION_MODE = 'membership';
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
        currentUserId: currentUser?.id,
      }),
    );

    // Reload to get fresh membership
    currentUser = await prisma.user.findFirstOrThrow({
      include: { memberships: true },
    });
    currentTenant = await prisma.tenant.findFirstOrThrow();
  });

  it('creates a subscription', async () => {
    mockStripeWebhookContructEvent.mockImplementation(() => {
      return {
        type: 'checkout.session.completed',
        data: {
          object: { id: 'stripe-subscription-id-1' },
        },
      };
    });

    mockStripeCheckoutSessionRetrieve.mockImplementation(async () => {
      return {
        mode: 'subscription',
        line_items: {
          data: [
            {
              price: {
                id: 'basic',
              },
            },
          ],
        },
        subscription: {
          status: SubscriptionStatus.active,
          id: 'stripe-subscription-id-1',
        },
        customer: {
          id: 'stripe-customer-id-1',
          metadata: {
            userId: currentUser.id,
            tenantId: currentTenant.id,
            membershipId: currentUser?.memberships?.[0].id,
          },
        },
      };
    });

    await subscriptionWebhookController({}, '', await testContext());

    const subscription = await prisma.subscription.findFirst({});

    expect(subscription?.userId).toBe(currentUser.id);
    expect(subscription?.tenantId).toBe(currentTenant.id);
    expect(subscription?.membershipId).toBe(currentUser?.memberships?.[0].id);
    expect(subscription?.stripeSubscriptionId).toBe('stripe-subscription-id-1');
    expect(subscription?.stripeCustomerId).toBe('stripe-customer-id-1');
    expect(subscription?.status).toBe('active');
    expect(subscription?.stripePriceId).toBe('basic');
    expect(subscription?.mode).toBe('membership');
  });

  it('updates a subscription', async () => {
    await prisma.subscription.create({
      data: {
        mode: SubscriptionMode.membership,
        status: SubscriptionStatus.active,
        stripeSubscriptionId: 'stripe-subscription-id-1',
        stripeCustomerId: 'stripe-customer-id-1',
        stripePriceId: 'basic',
        userId: currentUser.id,
        tenantId: currentTenant.id,
        membershipId: currentUser.memberships?.[0]?.id,
      },
    });

    mockStripeWebhookContructEvent.mockImplementation(() => {
      return {
        type: 'customer.subscription.updated',
        data: {
          object: {
            status: SubscriptionStatus.incomplete_expired,
            cancel_at_period_end: true,
            id: 'stripe-subscription-id-1',
            items: {
              data: [
                {
                  price: {
                    id: 'basic',
                  },
                },
              ],
            },
          },
        },
      };
    });

    await subscriptionWebhookController({}, '', await testContext());

    const subscription = await prisma.subscription.findFirst({});

    expect(subscription?.isCancelAtEndPeriod).toBe(true);
    expect(subscription?.status).toBe(SubscriptionStatus.incomplete_expired);

    expect(subscription?.userId).toBe(currentUser.id);
    expect(subscription?.tenantId).toBe(currentTenant.id);
    expect(subscription?.membershipId).toBe(currentUser?.memberships?.[0].id);
    expect(subscription?.stripeSubscriptionId).toBe('stripe-subscription-id-1');
    expect(subscription?.stripeCustomerId).toBe('stripe-customer-id-1');
    expect(subscription?.stripePriceId).toBe('basic');
    expect(subscription?.mode).toBe(SubscriptionMode.membership);
  });
});
