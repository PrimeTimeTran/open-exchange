import { z } from 'zod';

export interface StripeCustomerMetadata {
  userId?: string | null;
  tenantId?: string | null;
  membershipId?: string | null;
}

export const subscriptionCheckoutInputSchema = z.object({
  stripePriceId: z.string().trim(),
});

export const subscriptionCheckoutOutputSchema = z.object({
  sessionId: z.string(),
});

export const subscriptionPortalOutputSchema = z.object({
  url: z.string(),
});

export const subscriptionWebhookOutputSchema = z.object({
  received: z.boolean(),
});
