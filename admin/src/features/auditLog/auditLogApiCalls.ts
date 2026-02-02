import { AuditLogWithAuthor } from 'src/features/auditLog/AuditLogWithAuthor';
import {
  auditLogActivityChartOutputSchema,
  auditLogFindManyInputSchema,
} from 'src/features/auditLog/auditLogSchemas';
import { ApiErrorPayload } from 'src/shared/errors/ApiErrorPayload';
import { objectToQuery } from 'src/shared/lib/objectToQuery';
import { z } from 'zod';

export async function auditLogFindManyApiCall(
  { filter, orderBy, skip, take }: z.input<typeof auditLogFindManyInputSchema>,
  signal?: AbortSignal,
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/audit-log?${objectToQuery({
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
    auditLogs: AuditLogWithAuthor[];
  };
}

export async function auditLogFetchActivityChartApiCall({
  signal,
}: {
  signal?: AbortSignal;
}) {
  const response = await fetch(
    `${
      process.env.NEXT_PUBLIC_BACKEND_URL || ''
    }/api/audit-log/activity-chart?${objectToQuery({
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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

  return (await response.json()) as z.infer<
    typeof auditLogActivityChartOutputSchema
  >;
}
