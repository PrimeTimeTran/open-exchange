import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { TradeFill, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { tradeFillEnumerators } from 'src/features/tradeFill/tradeFillEnumerators';
import { numberCoerceSchema, numberOptionalCoerceSchema } from 'src/shared/schemas/numberCoerceSchema';
import { objectToUuidSchema, objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';
import { Trade } from '@prisma/client';

extendZodWithOpenApi(z);

export const tradeFillFindSchema = z.object({
  id: z.string(),
});

export const tradeFillFilterFormSchema = z
  .object({
    side: z.nativeEnum(tradeFillEnumerators.side).nullable().optional(),
    priceRange: z.array(z.coerce.number()).max(2),
    quantityRange: z.array(z.coerce.number()).max(2),
    feeRange: z.array(z.coerce.number()).max(2),
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

export const tradeFillFilterInputSchema = tradeFillFilterFormSchema
  .merge(
    z.object({

    }),
  )
  .partial();

export const tradeFillFindManyInputSchema = z.object({
  filter: tradeFillFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const tradeFillDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const tradeFillArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const tradeFillRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const tradeFillAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const tradeFillAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const tradeFillCreateInputSchema = z.object({
  side: z.nativeEnum(tradeFillEnumerators.side).nullable().optional(),
  price: numberOptionalCoerceSchema(z.number().nullable().optional()),
  quantity: numberOptionalCoerceSchema(z.number().nullable().optional()),
  fee: numberOptionalCoerceSchema(z.number().nullable().optional()),
  trade: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const tradeFillImportInputSchema =
  tradeFillCreateInputSchema.merge(importerInputSchema);

export const tradeFillImportFileSchema = z
  .object({
    side: z.string(),
    price: z.string(),
    quantity: z.string(),
    fee: z.string(),
    trade: z.string(),
  })
  .partial();

export const tradeFillUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const tradeFillUpdateBodyInputSchema =
  tradeFillCreateInputSchema.partial();

export interface TradeFillWithRelationships extends TradeFill {
  trade?: Trade;
  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
