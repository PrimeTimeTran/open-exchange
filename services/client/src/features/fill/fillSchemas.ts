import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Fill, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { fillEnumerators } from 'src/features/fill/fillEnumerators';
import { numberCoerceSchema, numberOptionalCoerceSchema } from 'src/shared/schemas/numberCoerceSchema';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';
import { objectToUuidSchema, objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';
import { Trade } from '@prisma/client';

extendZodWithOpenApi(z);

export const fillFindSchema = z.object({
  id: z.string(),
});

export const fillFilterFormSchema = z
  .object({
    side: z.nativeEnum(fillEnumerators.side).nullable().optional(),
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

export const fillFilterInputSchema = fillFilterFormSchema
  .merge(
    z.object({

    }),
  )
  .partial();

export const fillFindManyInputSchema = z.object({
  filter: fillFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const fillDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const fillArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const fillRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const fillAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const fillAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const fillCreateInputSchema = z.object({
  side: z.nativeEnum(fillEnumerators.side),
  price: numberCoerceSchema(z.number()),
  quantity: numberCoerceSchema(z.number()),
  fee: numberOptionalCoerceSchema(z.number().nullable().optional()),
  meta: jsonSchema.optional(),
  trade: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const fillImportInputSchema =
  fillCreateInputSchema.merge(importerInputSchema);

export const fillImportFileSchema = z
  .object({
    side: z.string(),
    price: z.string(),
    quantity: z.string(),
    fee: z.string(),
    meta: z.string(),
    trade: z.string(),
  })
  .partial();

export const fillUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const fillUpdateBodyInputSchema =
  fillCreateInputSchema.partial();

export interface FillWithRelationships extends Fill {
  trade?: Trade;
  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
