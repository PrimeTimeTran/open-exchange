import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Deposit, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { numberCoerceSchema, numberOptionalCoerceSchema } from 'src/shared/schemas/numberCoerceSchema';
import { depositEnumerators } from 'src/features/deposit/depositEnumerators';
import { dateTimeSchema, dateTimeOptionalSchema } from 'src/shared/schemas/dateTimeSchema';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';
import { objectToUuidSchema, objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';
import { Account } from '@prisma/client';
import { Asset } from '@prisma/client';

extendZodWithOpenApi(z);

export const depositFindSchema = z.object({
  id: z.string(),
});

export const depositFilterFormSchema = z
  .object({
    amountRange: z.array(z.coerce.number()).max(2),
    status: z.nativeEnum(depositEnumerators.status).nullable().optional(),
    chain: z.string(),
    txHash: z.string(),
    fromAddress: z.string(),
    confirmationsRange: z.array(z.coerce.number()).max(2),
    requiredConfirmationsRange: z.array(z.coerce.number()).max(2),
    detectedAtRange: z.array(dateTimeOptionalSchema).max(2),
    confirmedAtRange: z.array(dateTimeOptionalSchema).max(2),
    creditedAtRange: z.array(dateTimeOptionalSchema).max(2),
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

export const depositFilterInputSchema = depositFilterFormSchema
  .merge(
    z.object({

    }),
  )
  .partial();

export const depositFindManyInputSchema = z.object({
  filter: depositFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const depositDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const depositArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const depositRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const depositAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const depositAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const depositCreateInputSchema = z.object({
  amount: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  status: z.nativeEnum(depositEnumerators.status).nullable().optional(),
  chain: z.string().trim().nullable().optional(),
  txHash: z.string().trim().nullable().optional(),
  fromAddress: z.string().trim().nullable().optional(),
  confirmations: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  requiredConfirmations: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  detectedAt: dateTimeOptionalSchema,
  confirmedAt: dateTimeOptionalSchema,
  creditedAt: dateTimeOptionalSchema,
  meta: jsonSchema.optional(),
  account: objectToUuidSchemaOptional,
  asset: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const depositImportInputSchema =
  depositCreateInputSchema.merge(importerInputSchema);

export const depositImportFileSchema = z
  .object({
    amount: z.string(),
    status: z.string(),
    chain: z.string(),
    txHash: z.string(),
    fromAddress: z.string(),
    confirmations: z.string(),
    requiredConfirmations: z.string(),
    detectedAt: z.string(),
    confirmedAt: z.string(),
    creditedAt: z.string(),
    meta: z.string(),
    account: z.string(),
    asset: z.string(),
  })
  .partial();

export const depositUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const depositUpdateBodyInputSchema =
  depositCreateInputSchema.partial();

export interface DepositWithRelationships extends Deposit {
  account?: Account;
  asset?: Asset;
  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
