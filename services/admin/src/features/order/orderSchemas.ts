import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Order, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { orderEnumerators } from 'src/features/order/orderEnumerators';
import { numberCoerceSchema, numberOptionalCoerceSchema } from 'src/shared/schemas/numberCoerceSchema';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';
import { objectToUuidSchema, objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';
import { Account } from '@prisma/client';
import { Instrument } from '@prisma/client';
import { Trade } from '@prisma/client';

extendZodWithOpenApi(z);

export const orderFindSchema = z.object({
  id: z.string(),
});

export const orderFilterFormSchema = z
  .object({
    side: z.nativeEnum(orderEnumerators.side).nullable().optional(),
    type: z.nativeEnum(orderEnumerators.type).nullable().optional(),
    priceRange: z.array(z.coerce.number()).max(2),
    quantityRange: z.array(z.coerce.number()).max(2),
    quantityFilledRange: z.array(z.coerce.number()).max(2),
    status: z.nativeEnum(orderEnumerators.status).nullable().optional(),
    timeInFore: z.nativeEnum(orderEnumerators.timeInFore).nullable().optional(),
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

export const orderFilterInputSchema = orderFilterFormSchema
  .merge(
    z.object({

    }),
  )
  .partial();

export const orderFindManyInputSchema = z.object({
  filter: orderFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const orderDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const orderArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const orderRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const orderAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const orderAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const orderCreateInputSchema = z.object({
  side: z.nativeEnum(orderEnumerators.side).nullable().optional(),
  type: z.nativeEnum(orderEnumerators.type).nullable().optional(),
  price: numberOptionalCoerceSchema(z.number().nullable().optional()),
  quantity: numberOptionalCoerceSchema(z.number().nullable().optional()),
  quantityFilled: numberOptionalCoerceSchema(z.number().nullable().optional()),
  status: z.nativeEnum(orderEnumerators.status).nullable().optional(),
  timeInFore: z.nativeEnum(orderEnumerators.timeInFore).nullable().optional(),
  meta: jsonSchema.optional(),
  account: objectToUuidSchemaOptional,
  instrument: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const orderImportInputSchema =
  orderCreateInputSchema.merge(importerInputSchema);

export const orderImportFileSchema = z
  .object({
    side: z.string(),
    type: z.string(),
    price: z.string(),
    quantity: z.string(),
    quantityFilled: z.string(),
    status: z.string(),
    timeInFore: z.string(),
    meta: z.string(),
    account: z.string(),
    instrument: z.string(),
  })
  .partial();

export const orderUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const orderUpdateBodyInputSchema =
  orderCreateInputSchema.partial();

export interface OrderWithRelationships extends Order {
  account?: Account;
  instrument?: Instrument;
  buys?: Trade[];
  sells?: Trade[];
  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
