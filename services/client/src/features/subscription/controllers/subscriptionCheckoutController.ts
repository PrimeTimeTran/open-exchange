import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { SubscriptionMode } from '@prisma/client';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { subscriptionIsValidStripePriceId } from 'src/features/subscription/subscriptionIsValidStripePriceId';
import {
  StripeCustomerMetadata,
  subscriptionCheckoutInputSchema,
  subscriptionCheckoutOutputSchema,
} from 'src/features/subscription/subscriptionSchemas';
import { subscriptionSelectAndValidateDefaultMode } from 'src/features/subscription/subscriptionSelectAndValidateDefaultMode';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';
import Stripe from 'stripe';
import { z } from 'zod';

export const subscriptionCheckoutApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/subscription/checkout',
  request: {
    body: {
      content: {
        'application/json': {
          schema: subscriptionCheckoutInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: subscriptionCheckoutOutputSchema,
        },
      },
    },
  },
};

export async function subscriptionCheckoutController(
  query: unknown,
  context: AppContext,
): Promise<z.infer<typeof subscriptionCheckoutOutputSchema>> {
  const { stripePriceId } = subscriptionCheckoutInputSchema.parse(query);

  if (!subscriptionIsValidStripePriceId(stripePriceId)) {
    throw new Error400(
      formatTranslation(
        context.dictionary.shared.errors.invalid,
        'stripePriceId',
      ),
    );
  }

  validateHasPermission(permissions.subscriptionCreate, context);

  if (context.currentSubscription) {
    throw new Error400(
      context.dictionary.subscription.errors.alreadyExistsActive,
    );
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error400(
      context.dictionary.subscription.errors.stripeNotConfigured,
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });

  const customer = await _findOrCreateStripeCustomer(stripe, context);

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: stripePriceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.FRONTEND_URL}/subscription`,
    cancel_url: `${process.env.FRONTEND_URL}/subscription`,
    customer: customer.id,
  });

  return { sessionId: session.id };
}

async function _findOrCreateStripeCustomer(
  stripe: Stripe,
  context: AppContext,
) {
  const subscriptionMode = subscriptionSelectAndValidateDefaultMode(context);

  const customers = await stripe.customers.list({
    email: context?.currentUser?.email,
    limit: 100,
  });

  let customer = customers?.data?.find((customer) => {
    const metadata: StripeCustomerMetadata = customer.metadata;

    if (subscriptionMode === SubscriptionMode.tenant) {
      return (
        metadata.tenantId === context.currentTenant?.id &&
        !metadata.membershipId
      );
    }

    if (subscriptionMode === SubscriptionMode.membership) {
      return (
        metadata.tenantId === context.currentTenant?.id &&
        metadata.membershipId === context.currentMembership?.id
      );
    }

    return !metadata.tenantId && !metadata.membershipId;
  });

  if (!customer) {
    let metadata: StripeCustomerMetadata = {
      userId: context.currentUser?.id || null,
    };

    if (subscriptionMode === SubscriptionMode.tenant) {
      metadata.tenantId = context.currentTenant?.id || null;
    }

    if (subscriptionMode === SubscriptionMode.membership) {
      metadata.tenantId = context.currentTenant?.id || null;
      metadata.membershipId = context.currentMembership?.id || null;
    }

    customer = await stripe.customers.create({
      email: context?.currentUser?.email,
      metadata: {
        ...metadata,
      },
    });
  }

  return customer;
}
