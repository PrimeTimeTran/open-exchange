import { Tenant } from '@prisma/client';
import {
  tenantCreateInputSchema,
  tenantFindManyInputSchema,
  tenantUpdateInputSchema,
} from 'src/features/tenant/tenantSchemas';
import { ApiErrorPayload } from 'src/shared/errors/ApiErrorPayload';
import { objectToQuery } from 'src/shared/lib/objectToQuery';
import { z } from 'zod';

export async function tenantFindManyApiCall(
  { filter, orderBy, skip, take }: z.input<typeof tenantFindManyInputSchema>,
  signal?: AbortSignal,
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/tenant?${objectToQuery({
      filter,
      orderBy,
      skip,
      take,
    })}`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal,
    },
  );

  if (!response.ok) {
    const payload = (await response.json()) as ApiErrorPayload;
    throw new Error(payload.errors?.[0]?.message);
  }

  return (await response.json()) as {
    count: number;
    tenants: Tenant[];
  };
}

export async function tenantCreateApiCall(
  body: z.input<typeof tenantCreateInputSchema>,
  signal?: AbortSignal,
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/tenant`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    },
  );

  if (!response.ok) {
    const payload = (await response.json()) as ApiErrorPayload;
    throw new Error(payload.errors?.[0]?.message);
  }
}

export async function tenantDestroyApiCall(id: string, signal?: AbortSignal) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/tenant/${id}`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      signal,
    },
  );

  if (!response.ok) {
    const payload = (await response.json()) as ApiErrorPayload;
    throw new Error(payload.errors?.[0]?.message);
  }
}

export async function tenantUpdateApiCall(
  id: string,
  body: z.input<typeof tenantUpdateInputSchema>,
  signal?: AbortSignal,
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/tenant/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    },
  );

  if (!response.ok) {
    const payload = (await response.json()) as ApiErrorPayload;
    throw new Error(payload.errors?.[0]?.message);
  }
}
