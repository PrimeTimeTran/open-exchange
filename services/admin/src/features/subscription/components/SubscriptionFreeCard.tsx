import { FaCheckCircle } from 'react-icons/fa';
import { AppContext } from 'src/shared/controller/appContext';

export default function SubscriptionFreeCard({
  context,
}: {
  context: AppContext;
}) {
  const { dictionary } = context;

  return (
    <div className="mb-4 flex h-full flex-col justify-between rounded-md border p-8">
      <div>
        <div className="mb-6 grow-0 text-center text-3xl font-bold">
          {dictionary.subscription.plans.free.title}
        </div>
        <div className="mb-4 grow-0 text-center text-3xl font-bold">
          {dictionary.subscription.plans.free.price}
          <span className="text-base font-normal">
            {dictionary.subscription.plans.free.pricingPeriod}
          </span>
        </div>
        <ul className="flex flex-col gap-1 py-6 text-muted-foreground">
          <li className="flex items-center gap-2">
            <FaCheckCircle className="h-5 w-5 text-primary" />{' '}
            {dictionary.subscription.plans.free.features.first}
          </li>
          <li className="flex items-center gap-2">
            <FaCheckCircle className="h-5 w-5 text-primary" />{' '}
            {dictionary.subscription.plans.free.features.second}
          </li>
          <li className="flex items-center gap-2">
            <FaCheckCircle className="h-5 w-5 text-primary" />{' '}
            {dictionary.subscription.plans.free.features.third}
          </li>
        </ul>
      </div>
    </div>
  );
}
