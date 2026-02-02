export type SubscriptionPlan = {
  id: 'free' | 'basic' | 'enterprise';
  stripePriceId?: string;
};

export const subscriptionPlans: Record<
  'free' | 'basic' | 'enterprise',
  SubscriptionPlan
> = {
  free: {
    id: 'free',
  },
  basic: {
    id: 'basic',
    stripePriceId: process.env.NEXT_PUBLIC_SUBSCRIPTION_PRICES_BASIC!,
  },
  enterprise: {
    id: 'enterprise',
    stripePriceId: process.env.NEXT_PUBLIC_SUBSCRIPTION_PRICES_ENTERPRISE!,
  },
} as const;
