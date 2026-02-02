import { SubscriptionMode } from '@prisma/client';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';

export function subscriptionSelectAndValidateDefaultMode(context: AppContext) {
  const subscriptionMode = (process.env.NEXT_PUBLIC_SUBSCRIPTION_MODE ||
    'disabled') as SubscriptionMode;

  if (!Object.values(SubscriptionMode).includes(subscriptionMode)) {
    throw new Error400(context.dictionary.subscription.errors.disabled);
  }

  return subscriptionMode;
}
