import { SubscriptionStatus } from '@prisma/client';

// See https://stripe.com/docs/api/subscriptions/object#subscription_object-status
export const subscriptionStatuses = {
  active: [
    SubscriptionStatus.active,
    SubscriptionStatus.trialing,
    SubscriptionStatus.incomplete,
    SubscriptionStatus.past_due,
  ],
  inactive: [
    SubscriptionStatus.canceled,
    SubscriptionStatus.incomplete_expired,
    SubscriptionStatus.unpaid,
    SubscriptionStatus.paused,
  ],
};
