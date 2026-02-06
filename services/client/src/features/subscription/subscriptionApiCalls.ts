import {
  subscriptionCheckoutInputSchema,
  subscriptionCheckoutOutputSchema,
  subscriptionPortalOutputSchema,
} from 'src/features/subscription/subscriptionSchemas';
import { ApiErrorPayload } from 'src/shared/errors/ApiErrorPayload';
import { z } from 'zod';

export async function subscriptionCheckoutApiCall(
  data?: z.input<typeof subscriptionCheckoutInputSchema>,
  signal?: AbortSignal,
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/subscription/checkout`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal,
    },
  );

  if (!response.ok) {
    const payload = (await response.json()) as ApiErrorPayload;
    throw new Error(payload.errors?.[0]?.message);
  }

  return (await response.json()) as z.infer<
    typeof subscriptionCheckoutOutputSchema
  >;
}

export async function subscriptionPortalApiCall(signal?: AbortSignal) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/subscription/portal`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
    },
  );

  if (!response.ok) {
    const payload = (await response.json()) as ApiErrorPayload;
    throw new Error(payload.errors?.[0]?.message);
  }

  return (await response.json()) as z.infer<
    typeof subscriptionPortalOutputSchema
  >;
}
