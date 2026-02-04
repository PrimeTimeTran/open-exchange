import { subscriptionStatuses } from 'src/features/subscription/subscriptionStatuses';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';
import Stripe from 'stripe';

export async function subscriptionCancelOnStripe(
  userId: string,
  tenantId: string,
  context: AppContext,
) {
  if (!process.env.STRIPE_SECRET_KEY) {
    Logger.warn(context.dictionary.subscription.errors.stripeNotConfigured);
    return;
  }

  const prisma = prismaAuth(context);

  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId,
      tenantId,
    },
  });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });

  for (let subscription of subscriptions) {
    const isActive = subscriptionStatuses.active.some(
      (activeStatus) => activeStatus === subscription.status,
    );

    if (isActive) {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }
  }
}
