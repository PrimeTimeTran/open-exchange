import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { BalanceSnapshot, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { numberCoerceSchema, numberOptionalCoerceSchema } from 'src/shared/schemas/numberCoerceSchema';
import { dateTimeSchema, dateTimeOptionalSchema } from 'src/shared/schemas/dateTimeSchema';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';
import { objectToUuidSchema, objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';
import { Account } from '@prisma/client';
import { Wallet } from '@prisma/client';
import { Asset } from '@prisma/client';

extendZodWithOpenApi(z);

export const balanceSnapshotFindSchema = z.object({
  id: z.string(),
});

export const balanceSnapshotFilterFormSchema = z
  .object({
    availableRange: z.array(z.coerce.number()).max(2),
    lockedRange: z.array(z.coerce.number()).max(2),
    totalRange: z.array(z.coerce.number()).max(2),
    snapshotAtRange: z.array(dateTimeOptionalSchema).max(2),
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

export const balanceSnapshotFilterInputSchema = balanceSnapshotFilterFormSchema
  .merge(
    z.object({

    }),
  )
  .partial();

export const balanceSnapshotFindManyInputSchema = z.object({
  filter: balanceSnapshotFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const balanceSnapshotDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const balanceSnapshotArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const balanceSnapshotRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const balanceSnapshotAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const balanceSnapshotAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const balanceSnapshotCreateInputSchema = z.object({
  available: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  locked: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  total: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  snapshotAt: dateTimeOptionalSchema,
  meta: jsonSchema.optional(),
  account: objectToUuidSchemaOptional,
  wallet: objectToUuidSchemaOptional,
  asset: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const balanceSnapshotImportInputSchema =
  balanceSnapshotCreateInputSchema.merge(importerInputSchema);

export const balanceSnapshotImportFileSchema = z
  .object({
    available: z.string(),
    locked: z.string(),
    total: z.string(),
    snapshotAt: z.string(),
    meta: z.string(),
    account: z.string(),
    wallet: z.string(),
    asset: z.string(),
  })
  .partial();

export const balanceSnapshotUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const balanceSnapshotUpdateBodyInputSchema =
  balanceSnapshotCreateInputSchema.partial();

export interface BalanceSnapshotWithRelationships extends BalanceSnapshot {
  account?: Account;
  wallet?: Wallet;
  asset?: Asset;
  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
