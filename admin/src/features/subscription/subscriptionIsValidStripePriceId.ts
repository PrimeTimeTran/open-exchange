import { subscriptionPlans } from 'src/features/subscription/subscriptionPaidPlans';
import { objectKeys } from 'src/shared/lib/objectKeys';

export function subscriptionIsValidStripePriceId(stripePriceId?: string) {
  if (!stripePriceId) {
    return false;
  }

  return objectKeys(subscriptionPlans).some((key) => {
    const plan = subscriptionPlans[key];
    return plan.stripePriceId === stripePriceId;
  });
}
