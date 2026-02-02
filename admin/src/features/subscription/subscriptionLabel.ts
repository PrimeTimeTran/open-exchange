import { Subscription, Tenant } from '@prisma/client';

export function subscriptionLabel(subscription?: Subscription | null) {
  return subscription?.stripePriceId;
}
