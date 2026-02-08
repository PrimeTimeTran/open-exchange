import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Wallet, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { numberCoerceSchema, numberOptionalCoerceSchema } from 'src/shared/schemas/numberCoerceSchema';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';
import { objectToUuidSchema, objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';
import { Asset } from '@prisma/client';
import { Account } from '@prisma/client';
import { BalanceSnapshot } from '@prisma/client';

extendZodWithOpenApi(z);

export const walletFindSchema = z.object({
  id: z.string(),
});

export const walletFilterFormSchema = z
  .object({
    availableRange: z.array(z.coerce.number()).max(2),
    lockedRange: z.array(z.coerce.number()).max(2),
    totalRange: z.array(z.coerce.number()).max(2),
    versionRange: z.array(z.coerce.number()).max(2),
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

export const walletFilterInputSchema = walletFilterFormSchema
  .merge(
    z.object({

    }),
  )
  .partial();

export const walletFindManyInputSchema = z.object({
  filter: walletFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const walletDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const walletArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const walletRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const walletAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const walletAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const walletCreateInputSchema = z.object({
  available: numberOptionalCoerceSchema(z.number().nullable().optional()),
  locked: numberOptionalCoerceSchema(z.number().nullable().optional()),
  total: numberOptionalCoerceSchema(z.number().nullable().optional()),
  version: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  meta: jsonSchema.optional(),
  user: objectToUuidSchemaOptional,
  asset: objectToUuidSchemaOptional,
  account: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const walletImportInputSchema =
  walletCreateInputSchema.merge(importerInputSchema);

export const walletImportFileSchema = z
  .object({
    available: z.string(),
    locked: z.string(),
    total: z.string(),
    version: z.string(),
    meta: z.string(),
    user: z.string(),
    asset: z.string(),
    account: z.string(),
  })
  .partial();

export const walletUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const walletUpdateBodyInputSchema =
  walletCreateInputSchema.partial();

export interface WalletWithRelationships extends Wallet {
  user?: Membership;
  asset?: Asset;
  account?: Account;
  snapshots?: BalanceSnapshot[];
  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
