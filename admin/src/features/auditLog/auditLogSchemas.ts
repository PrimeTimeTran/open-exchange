import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { auditLogOperations } from 'src/features/auditLog/auditLogOperations';
import { dateTimeSchema } from 'src/shared/schemas/dateTimeSchema';
import { objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import dictionary from 'src/translation/en/en';
import { z } from 'zod';

dayjs.extend(utc);
dayjs.extend(timezone);

extendZodWithOpenApi(z);

function isValidTimezone(tz: string) {
  try {
    dayjs().tz(tz);
    return true;
  } catch (e) {
    return false;
  }
}

export const auditLogActivityChartInputSchema = z.object({
  timezone: z.string().refine(isValidTimezone, {
    message: dictionary.shared.errors.timezone,
  }),
});

export const auditLogActivityChartOutputSchema = z.array(
  z.object({
    timestamp: z.string().datetime(),
    count: z.number(),
  }),
);

export const auditLogFilterFormSchema = z
  .object({
    entityNames: z.array(z.string().trim()),
    entityId: z.string().optional(),
    apiHttpResponseCode: z.string().trim(),
    apiEndpoint: z.string().trim(),
    transactionId: z.string().trim(),
    operations: z.array(z.nativeEnum(auditLogOperations)),
    timestampRange: z.array(dateTimeSchema).max(2),

    apiKey: z.any(),
    membership: z.any(),
  })
  .partial();

export const auditLogFilterInputSchema = auditLogFilterFormSchema
  .merge(
    z.object({
      apiKey: objectToUuidSchemaOptional,
      membership: objectToUuidSchemaOptional,
    }),
  )
  .partial();

export const auditLogFindManyInputSchema = z.object({
  filter: auditLogFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ timestamp: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});
