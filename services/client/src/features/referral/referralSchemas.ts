import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Referral, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { referralEnumerators } from 'src/features/referral/referralEnumerators';
import { numberCoerceSchema, numberOptionalCoerceSchema } from 'src/shared/schemas/numberCoerceSchema';
import { dateTimeSchema, dateTimeOptionalSchema } from 'src/shared/schemas/dateTimeSchema';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';

extendZodWithOpenApi(z);

export const referralFindSchema = z.object({
  id: z.string(),
});

export const referralFilterFormSchema = z
  .object({
    referrerUserId: z.string(),
    referredUserId: z.string(),
    referralCode: z.string(),
    source: z.nativeEnum(referralEnumerators.source).nullable().optional(),
    status: z.nativeEnum(referralEnumerators.status).nullable().optional(),
    rewardType: z.nativeEnum(referralEnumerators.rewardType).nullable().optional(),
    rewardAmountRange: z.array(z.coerce.number()).max(2),
    rewardCurrency: z.string(),
    rewardedAtRange: z.array(dateTimeOptionalSchema).max(2),
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

export const referralFilterInputSchema = referralFilterFormSchema
  .merge(
    z.object({

    }),
  )
  .partial();

export const referralFindManyInputSchema = z.object({
  filter: referralFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const referralDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const referralArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const referralRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const referralAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const referralAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const referralCreateInputSchema = z.object({
  referrerUserId: z.string().trim().nullable().optional(),
  referredUserId: z.string().trim().nullable().optional(),
  referralCode: z.string().trim().nullable().optional(),
  source: z.nativeEnum(referralEnumerators.source).nullable().optional(),
  status: z.nativeEnum(referralEnumerators.status).nullable().optional(),
  rewardType: z.nativeEnum(referralEnumerators.rewardType).nullable().optional(),
  rewardAmount: numberOptionalCoerceSchema(z.number().nullable().optional()),
  rewardCurrency: z.string().trim().nullable().optional(),
  rewardedAt: dateTimeOptionalSchema,
  meta: jsonSchema.optional(),
  importHash: z.string().optional(),
});

export const referralImportInputSchema =
  referralCreateInputSchema.merge(importerInputSchema);

export const referralImportFileSchema = z
  .object({
    referrerUserId: z.string(),
    referredUserId: z.string(),
    referralCode: z.string(),
    source: z.string(),
    status: z.string(),
    rewardType: z.string(),
    rewardAmount: z.string(),
    rewardCurrency: z.string(),
    rewardedAt: z.string(),
    meta: z.string(),
  })
  .partial();

export const referralUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const referralUpdateBodyInputSchema =
  referralCreateInputSchema.partial();

export interface ReferralWithRelationships extends Referral {

  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
