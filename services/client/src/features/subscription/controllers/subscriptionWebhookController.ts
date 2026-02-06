import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { SubscriptionMode } from '@prisma/client';
import { subscriptionIsValidStripePriceId } from 'src/features/subscription/subscriptionIsValidStripePriceId';
import {
  StripeCustomerMetadata,
  subscriptionWebhookOutputSchema,
} from 'src/features/subscription/subscriptionSchemas';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { Logger } from 'src/shared/lib/Logger';
import Stripe from 'stripe';

export const subscriptionWebhookApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/subscription/webhook',
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: subscriptionWebhookOutputSchema,
        },
      },
    },
  },
};

export async function subscriptionWebhookController(
  rawBody: any,
  stripeSignature: string,
  context: AppContext,
) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error400(
      context.dictionary.subscription.errors.stripeNotConfigured,
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });

  const event = stripe.webhooks.constructEvent(
    rawBody,
    stripeSignature,
    process.env.STRIPE_WEBHOOK_SECRET || '',
  );

  if (event.type === 'checkout.session.completed') {
    await _processStripeCheckoutSessionCompleted(stripe, event, context);
  }

  if (
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    await _processStripeCustomerSubscriptionUpdatedOrDeleted(
      stripe,
      event,
      context,
    );
  }
}

function _selectModeFromCustomerMetadata(
  customerMetadata: StripeCustomerMetadata,
) {
  if (customerMetadata.membershipId) {
    return SubscriptionMode.membership;
  }

  if (customerMetadata.tenantId) {
    return SubscriptionMode.tenant;
  }

  if (customerMetadata.userId) {
    return SubscriptionMode.user;
  }

  return SubscriptionMode.disabled;
}

async function _processStripeCheckoutSessionCompleted(
  stripe: Stripe,
  event: Stripe.Event,
  context: AppContext,
) {
  const data = event.data.object as { id: string };

  const stripeCheckoutSession = await stripe.checkout.sessions.retrieve(
    data.id,
    {
      expand: ['line_items', 'customer', 'subscription'],
    },
  );

  if (stripeCheckoutSession.mode !== 'subscription') {
    Logger.warn(`Skipping ${event.type} because it's not a subscription.`);
    return;
  }

  const stripePriceId = stripeCheckoutSession.line_items?.data[0]?.price
    ?.id as string;

  if (!subscriptionIsValidStripePriceId(stripePriceId)) {
    Logger.warn(
      `Skipping ${event.type} because the price ${stripePriceId} was not found in the environment variables.`,
    );
    return;
  }

  const stripeSubscription =
    stripeCheckoutSession.subscription as Stripe.Subscription;
  const stripeCustomer = stripeCheckoutSession.customer as Stripe.Customer;
  const stripeCustomerMetadata =
    stripeCustomer.metadata as StripeCustomerMetadata;

  const mode = _selectModeFromCustomerMetadata(stripeCustomerMetadata);

  if (mode === 'disabled') {
    Logger.warn(
      `Skipping ${
        event.type
      } because the customer metadata is invalid: ${JSON.stringify(
        stripeCustomerMetadata,
      )}.`,
    );
    return;
  }

  // This method is called via webhook so the auth
  // must be bypassed
  const prisma = prismaDangerouslyBypassAuth();

  await prisma.subscription.create({
    data: {
      mode,
      status: stripeSubscription.status,
      stripeSubscriptionId: stripeSubscription.id,
      stripeCustomerId: stripeCustomer.id,
      stripePriceId,
      userId: stripeCustomerMetadata.userId as string,
      tenantId: stripeCustomerMetadata.tenantId || undefined,
      membershipId: stripeCustomerMetadata.membershipId || undefined,
    },
  });
}

async function _processStripeCustomerSubscriptionUpdatedOrDeleted(
  stripe: Stripe,
  event: Stripe.Event,
  context: AppContext,
) {
  const stripeSubscription = event.data.object as Stripe.Subscription;
  const stripePriceId = stripeSubscription?.items?.data?.[0]?.price
    ?.id as string;

  if (!subscriptionIsValidStripePriceId(stripePriceId)) {
    Logger.warn(
      `Skipping ${event.type} because the price ${stripePriceId} was not found in the environment variables.`,
    );
    return;
  }

  // This method is called via webhook so the auth
  // must be bypassed
  const prisma = prismaDangerouslyBypassAuth();

  await prisma.subscription.update({
    data: {
      status: stripeSubscription.status,
      isCancelAtEndPeriod: stripeSubscription.cancel_at_period_end,
      stripePriceId: stripePriceId,
    },
    where: {
      stripeSubscriptionId: stripeSubscription.id,
    },
  });
}
