import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Asset, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { assetEnumerators } from 'src/features/asset/assetEnumerators';
import { numberCoerceSchema, numberOptionalCoerceSchema } from 'src/shared/schemas/numberCoerceSchema';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';
import { objectToUuidSchema, objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';
import { Instrument } from '@prisma/client';
import { Wallet } from '@prisma/client';
import { Deposit } from '@prisma/client';
import { Withdrawal } from '@prisma/client';
import { BalanceSnapshot } from '@prisma/client';

extendZodWithOpenApi(z);

export const assetFindSchema = z.object({
  id: z.string(),
});

export const assetFilterFormSchema = z
  .object({
    symbol: z.string(),
    type: z.nativeEnum(assetEnumerators.type).nullable().optional(),
    precisionRange: z.array(z.coerce.number()).max(2),
    isFractional: z.string().nullable().optional(),
    decimalsRange: z.array(z.coerce.number()).max(2),
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

export const assetFilterInputSchema = assetFilterFormSchema
  .merge(
    z.object({
      isFractional: z.string().optional().nullable().transform((val) => val != null && val !== '' ? val === 'true' : null),
    }),
  )
  .partial();

export const assetFindManyInputSchema = z.object({
  filter: assetFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const assetDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const assetArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const assetRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const assetAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ symbol: 'asc' }),
});

export const assetAutocompleteOutputSchema = z.object({
  id: z.string(),
  symbol: z.string(),
});

export const assetCreateInputSchema = z.object({
  symbol: z.string().trim().min(1),
  type: z.nativeEnum(assetEnumerators.type).nullable().optional(),
  precision: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  isFractional: z.boolean().default(false),
  meta: jsonSchema.optional(),
  decimals: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  importHash: z.string().optional(),
});

export const assetImportInputSchema =
  assetCreateInputSchema.merge(importerInputSchema);

export const assetImportFileSchema = z
  .object({
    symbol: z.string(),
    type: z.string(),
    precision: z.string(),
    isFractional: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    meta: z.string(),
    decimals: z.string(),
  })
  .partial();

export const assetUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const assetUpdateBodyInputSchema =
  assetCreateInputSchema.partial();

export interface AssetWithRelationships extends Asset {
  baseInstruments?: Instrument[];
  quoteInstruments?: Instrument[];
  wallets?: Wallet[];
  deposits?: Deposit[];
  withdrawals?: Withdrawal[];
  snapshots?: BalanceSnapshot[];
  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
