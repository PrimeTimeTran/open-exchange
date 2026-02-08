import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Withdrawal, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { numberCoerceSchema, numberOptionalCoerceSchema } from 'src/shared/schemas/numberCoerceSchema';
import { withdrawalEnumerators } from 'src/features/withdrawal/withdrawalEnumerators';
import { dateTimeSchema, dateTimeOptionalSchema } from 'src/shared/schemas/dateTimeSchema';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';
import { objectToUuidSchema, objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';
import { Account } from '@prisma/client';
import { Asset } from '@prisma/client';

extendZodWithOpenApi(z);

export const withdrawalFindSchema = z.object({
  id: z.string(),
});

export const withdrawalFilterFormSchema = z
  .object({
    amountRange: z.array(z.coerce.number()).max(2),
    feeRange: z.array(z.coerce.number()).max(2),
    status: z.nativeEnum(withdrawalEnumerators.status).nullable().optional(),
    destinationAddress: z.string(),
    destinationTag: z.string(),
    chain: z.string(),
    txHash: z.string(),
    failureReason: z.string(),
    requestedBy: z.string(),
    approvedBy: z.string(),
    approvedAtRange: z.array(dateTimeOptionalSchema).max(2),
    requestedAtRange: z.array(dateTimeOptionalSchema).max(2),
    broadcastAtRange: z.array(dateTimeOptionalSchema).max(2),
    confirmedAtRange: z.array(dateTimeOptionalSchema).max(2),
    confirmationsRange: z.array(z.coerce.number()).max(2),
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

export const withdrawalFilterInputSchema = withdrawalFilterFormSchema
  .merge(
    z.object({

    }),
  )
  .partial();

export const withdrawalFindManyInputSchema = z.object({
  filter: withdrawalFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const withdrawalDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const withdrawalArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const withdrawalRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const withdrawalAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const withdrawalAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const withdrawalCreateInputSchema = z.object({
  amount: numberCoerceSchema(z.number().min(25).positive()),
  fee: numberOptionalCoerceSchema(z.number().nullable().optional()),
  status: z.nativeEnum(withdrawalEnumerators.status).nullable().optional(),
  destinationAddress: z.string().trim().nullable().optional(),
  destinationTag: z.string().trim().nullable().optional(),
  chain: z.string().trim().nullable().optional(),
  txHash: z.string().trim().nullable().optional(),
  failureReason: z.string().trim().nullable().optional(),
  requestedBy: z.string().trim().nullable().optional(),
  approvedBy: z.string().trim().nullable().optional(),
  approvedAt: dateTimeOptionalSchema,
  requestedAt: dateTimeOptionalSchema,
  broadcastAt: dateTimeOptionalSchema,
  confirmedAt: dateTimeOptionalSchema,
  confirmations: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  meta: jsonSchema.optional(),
  account: objectToUuidSchemaOptional,
  asset: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const withdrawalImportInputSchema =
  withdrawalCreateInputSchema.merge(importerInputSchema);

export const withdrawalImportFileSchema = z
  .object({
    amount: z.string(),
    fee: z.string(),
    status: z.string(),
    destinationAddress: z.string(),
    destinationTag: z.string(),
    chain: z.string(),
    txHash: z.string(),
    failureReason: z.string(),
    requestedBy: z.string(),
    approvedBy: z.string(),
    approvedAt: z.string(),
    requestedAt: z.string(),
    broadcastAt: z.string(),
    confirmedAt: z.string(),
    confirmations: z.string(),
    meta: z.string(),
    account: z.string(),
    asset: z.string(),
  })
  .partial();

export const withdrawalUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const withdrawalUpdateBodyInputSchema =
  withdrawalCreateInputSchema.partial();

export interface WithdrawalWithRelationships extends Withdrawal {
  account?: Account;
  asset?: Asset;
  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
