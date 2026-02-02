'use client';

import SubscriptionFreeCard from 'src/features/subscription/components/SubscriptionFreeCard';
import { SubscriptionPaidCard } from 'src/features/subscription/components/SubscriptionPaidCard';
import { subscriptionPlans } from 'src/features/subscription/subscriptionPaidPlans';
import { AppContext } from 'src/shared/controller/appContext';
import { objectKeys } from 'src/shared/lib/objectKeys';

export default function Subscription({ context }: { context: AppContext }) {
  const { dictionary } = context;

  return (
    <div className="flex h-full w-full flex-col items-center pt-4 md:pt-12">
      <h2 className="mb-12 text-4xl font-bold md:mb-16">
        {dictionary.subscription.title}
      </h2>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div>
          <SubscriptionFreeCard context={context} />
        </div>
        {objectKeys(subscriptionPlans)
          .filter((key) => subscriptionPlans[key].stripePriceId)
          .map((key) => (
            <div key={key}>
              <SubscriptionPaidCard
                subscriptionPlan={subscriptionPlans[key]}
                context={context}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
