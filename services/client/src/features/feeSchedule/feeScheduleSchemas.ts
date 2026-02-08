import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { FeeSchedule, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { feeScheduleEnumerators } from 'src/features/feeSchedule/feeScheduleEnumerators';
import { numberCoerceSchema, numberOptionalCoerceSchema } from 'src/shared/schemas/numberCoerceSchema';
import { dateTimeSchema, dateTimeOptionalSchema } from 'src/shared/schemas/dateTimeSchema';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';

extendZodWithOpenApi(z);

export const feeScheduleFindSchema = z.object({
  id: z.string(),
});

export const feeScheduleFilterFormSchema = z
  .object({
    scope: z.nativeEnum(feeScheduleEnumerators.scope).nullable().optional(),
    makerFeeBpsRange: z.array(z.coerce.number()).max(2),
    takerFeeBpsRange: z.array(z.coerce.number()).max(2),
    minFeeAmountRange: z.array(z.coerce.number()).max(2),
    effectiveFromRange: z.array(dateTimeOptionalSchema).max(2),
    effectiveToRange: z.array(dateTimeOptionalSchema).max(2),
    tier: z.string(),
    accountId: z.string(),
    instrumentId: z.string(),
    archived: z
    .any()
    .transform((val) =>
      val != null && val !== ''
        ? val === 'true' || val === true
          ? true
          : null
        : null,
    ),
  })
  .partial();

export const feeScheduleFilterInputSchema = feeScheduleFilterFormSchema
  .merge(
    z.object({

    }),
  )
  .partial();

export const feeScheduleFindManyInputSchema = z.object({
  filter: feeScheduleFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const feeScheduleDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const feeScheduleArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const feeScheduleRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const feeScheduleAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const feeScheduleAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const feeScheduleCreateInputSchema = z.object({
  scope: z.nativeEnum(feeScheduleEnumerators.scope).nullable().optional(),
  makerFeeBps: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  takerFeeBps: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  minFeeAmount: numberOptionalCoerceSchema(z.number().nullable().optional()),
  effectiveFrom: dateTimeOptionalSchema,
  effectiveTo: dateTimeOptionalSchema,
  tier: z.string().trim().nullable().optional(),
  accountId: z.string().trim().nullable().optional(),
  instrumentId: z.string().trim().nullable().optional(),
  meta: jsonSchema.optional(),
  importHash: z.string().optional(),
});

export const feeScheduleImportInputSchema =
  feeScheduleCreateInputSchema.merge(importerInputSchema);

export const feeScheduleImportFileSchema = z
  .object({
    scope: z.string(),
    makerFeeBps: z.string(),
    takerFeeBps: z.string(),
    minFeeAmount: z.string(),
    effectiveFrom: z.string(),
    effectiveTo: z.string(),
    tier: z.string(),
    accountId: z.string(),
    instrumentId: z.string(),
    meta: z.string(),
  })
  .partial();

export const feeScheduleUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const feeScheduleUpdateBodyInputSchema =
  feeScheduleCreateInputSchema.partial();

export interface FeeScheduleWithRelationships extends FeeSchedule {

  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
