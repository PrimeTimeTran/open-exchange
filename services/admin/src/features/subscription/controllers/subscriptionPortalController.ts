import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { subscriptionPortalOutputSchema } from 'src/features/subscription/subscriptionSchemas';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import Error403 from 'src/shared/errors/Error403';
import Stripe from 'stripe';
import { z } from 'zod';

export const subscriptionPortalApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/subscription/portal',
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: subscriptionPortalOutputSchema,
        },
      },
    },
  },
};

export async function subscriptionPortalController(
  context: AppContext,
): Promise<z.infer<typeof subscriptionPortalOutputSchema>> {
  validateHasPermission(permissions.subscriptionCreate, context);

  if (!context.currentSubscription) {
    throw new Error403();
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error400(
      context.dictionary.subscription.errors.stripeNotConfigured,
    );
  }

  const isSubscriptionUser =
    context.currentUser?.id === context.currentSubscription.userId;
  if (!isSubscriptionUser) {
    throw new Error403();
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });

  const session = await stripe.billingPortal.sessions.create({
    customer: context.currentSubscription.stripeCustomerId,
    return_url: `${process.env.FRONTEND_URL}/subscription`,
  });

  return { url: session.url };
}
