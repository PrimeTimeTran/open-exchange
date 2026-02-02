import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Trade, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { numberCoerceSchema, numberOptionalCoerceSchema } from 'src/shared/schemas/numberCoerceSchema';
import { objectToUuidSchema, objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';
import { Order } from '@prisma/client';
import { Instrument } from '@prisma/client';
import { TradeFill } from '@prisma/client';

extendZodWithOpenApi(z);

export const tradeFindSchema = z.object({
  id: z.string(),
});

export const tradeFilterFormSchema = z
  .object({
    priceRange: z.array(z.coerce.number()).max(2),
    quantityRange: z.array(z.coerce.number()).max(2),
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

export const tradeFilterInputSchema = tradeFilterFormSchema
  .merge(
    z.object({

    }),
  )
  .partial();

export const tradeFindManyInputSchema = z.object({
  filter: tradeFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const tradeDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const tradeArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const tradeRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const tradeAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const tradeAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const tradeCreateInputSchema = z.object({
  price: numberOptionalCoerceSchema(z.number().nullable().optional()),
  quantity: numberOptionalCoerceSchema(z.number().nullable().optional()),
  buyOrderId: z.array(objectToUuidSchema).optional(),
  sellOrderId: z.array(objectToUuidSchema).optional(),
  instrument: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const tradeImportInputSchema =
  tradeCreateInputSchema.merge(importerInputSchema);

export const tradeImportFileSchema = z
  .object({
    price: z.string(),
    quantity: z.string(),
    buyOrderId: z.string().transform((val) => val.split(' ')),
    sellOrderId: z.string().transform((val) => val.split(' ')),
    instrument: z.string(),
  })
  .partial();

export const tradeUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const tradeUpdateBodyInputSchema =
  tradeCreateInputSchema.partial();

export interface TradeWithRelationships extends Trade {
  buyOrderId?: Order[];
  sellOrderId?: Order[];
  instrument?: Instrument;
  tradeFills?: TradeFill[];
  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
