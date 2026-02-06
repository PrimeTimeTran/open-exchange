import { Tooltip } from '@radix-ui/react-tooltip';
import { loadStripe } from '@stripe/stripe-js';
import { useMutation } from '@tanstack/react-query';
import { FaCheckCircle } from 'react-icons/fa';
import { LuAlertCircle } from 'react-icons/lu';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import {
  subscriptionCheckoutApiCall,
  subscriptionPortalApiCall,
} from 'src/features/subscription/subscriptionApiCalls';
import { SubscriptionPlan } from 'src/features/subscription/subscriptionPaidPlans';
import { Alert, AlertDescription } from 'src/shared/components/ui/alert';
import { Button } from 'src/shared/components/ui/button';
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from 'src/shared/components/ui/tooltip';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';

export function SubscriptionPaidCard({
  subscriptionPlan,
  context,
}: {
  subscriptionPlan: SubscriptionPlan;
  context: AppContext;
}) {
  const { currentSubscription, currentMembership, dictionary } = context;

  const hasPermissionToEdit = hasPermission(
    permissions.subscriptionUpdate,
    context,
  );
  const isSubscriptionUser =
    !currentSubscription ||
    currentSubscription?.userId === currentMembership?.userId;

  const isCurrentPlan =
    currentSubscription?.stripePriceId === subscriptionPlan.stripePriceId;

  const checkoutMutation = useMutation({
    mutationFn: () => {
      return Promise.all([
        loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!),
        subscriptionCheckoutApiCall({
          stripePriceId: subscriptionPlan.stripePriceId!,
        }),
      ]);
    },
    onSuccess: async (response) => {
      const [stripe, checkoutResponse] = response;
      const { error } = await stripe!.redirectToCheckout(checkoutResponse);
      if (error) {
        console.error(error);
      }
    },
    onError: (error: any) => {
      toast({
        description: error.message || dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  const portalMutation = useMutation({
    mutationFn: () => {
      return subscriptionPortalApiCall();
    },
    onSuccess: async (response) => {
      window.location.href = response.url;
    },
    onError: (error: any) => {
      toast({
        description: error.message || dictionary.shared.errors.unknown,
        variant: 'destructive',
      });
    },
  });

  const buttonState = isCurrentPlan
    ? 'manage'
    : !currentSubscription
    ? 'payment'
    : 'none';

  return (
    <div className="mb-4 flex h-full flex-col justify-between rounded-md border p-8">
      <div>
        <div className="mb-6 grow-0 text-center text-3xl font-bold">
          {dictionary.subscription.plans[subscriptionPlan.id].title}
        </div>
        <div className="mb-4 grow-0 text-center text-3xl font-bold">
          {dictionary.subscription.plans[subscriptionPlan.id].price}
          <span className="text-base font-normal">
            {dictionary.subscription.plans[subscriptionPlan.id].pricingPeriod}
          </span>
        </div>

        <ul className="flex flex-col gap-1 py-6 text-muted-foreground">
          <li className="flex items-center gap-2">
            <FaCheckCircle className="h-5 w-5 text-primary" />{' '}
            {dictionary.subscription.plans[subscriptionPlan.id].features.first}
          </li>
          <li className="flex items-center gap-2">
            <FaCheckCircle className="h-5 w-5 text-primary" />{' '}
            {dictionary.subscription.plans[subscriptionPlan.id].features.second}
          </li>
          <li className="flex items-center gap-2">
            <FaCheckCircle className="h-5 w-5 text-primary" />{' '}
            {dictionary.subscription.plans[subscriptionPlan.id].features.third}
          </li>
        </ul>

        {currentSubscription?.isCancelAtEndPeriod && isCurrentPlan ? (
          <Alert variant="destructive">
            <LuAlertCircle className="h-4 w-4" />
            <AlertDescription>
              {dictionary.subscription.cancelAtPeriodEnd}
            </AlertDescription>
          </Alert>
        ) : null}
      </div>

      <div>
        {buttonState === 'manage' && !isSubscriptionUser && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button type="button" className="w-full" disabled={true}>
                    {dictionary.subscription.manage}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {dictionary.subscription.notPlanUser}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {buttonState === 'manage' && isSubscriptionUser && (
          <Button
            type="button"
            className="w-full"
            disabled={!hasPermissionToEdit || portalMutation.isPending}
            onClick={() => portalMutation.mutateAsync()}
          >
            {dictionary.subscription.manage}
          </Button>
        )}

        {buttonState === 'payment' && (
          <Button
            type="button"
            className="w-full"
            disabled={
              !hasPermissionToEdit ||
              checkoutMutation.isPending ||
              !isSubscriptionUser
            }
            onClick={() => checkoutMutation.mutateAsync()}
          >
            {dictionary.subscription.subscribe}
          </Button>
        )}
      </div>
    </div>
  );
}
