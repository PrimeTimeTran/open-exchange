import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Instrument, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { instrumentEnumerators } from 'src/features/instrument/instrumentEnumerators';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';
import {
  objectToUuidSchema,
  objectToUuidSchemaOptional,
} from 'src/shared/schemas/objectToUuidSchema';
import { Asset } from '@prisma/client';
import { Order } from '@prisma/client';
import { Trade } from '@prisma/client';

extendZodWithOpenApi(z);

export const instrumentFindSchema = z.object({
  id: z.string(),
});

export const instrumentFilterFormSchema = z
  .object({
    symbol: z.string(),
    type: z.nativeEnum(instrumentEnumerators.type).nullable().optional(),
    status: z.nativeEnum(instrumentEnumerators.status).nullable().optional(),
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

export const instrumentFilterInputSchema = instrumentFilterFormSchema
  .merge(z.object({}))
  .partial();

export const instrumentFindManyInputSchema = z.object({
  filter: instrumentFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const instrumentDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const instrumentArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const instrumentRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const instrumentAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ symbol: 'asc' }),
});

export const instrumentAutocompleteOutputSchema = z.object({
  id: z.string(),
  symbol: z.string(),
});

export const instrumentCreateInputSchema = z.object({
  symbol: z.string().trim().min(1),
  type: z.nativeEnum(instrumentEnumerators.type).nullable().optional(),
  status: z.nativeEnum(instrumentEnumerators.status).nullable().optional(),
  meta: jsonSchema.optional(),
  underlyingAsset: objectToUuidSchemaOptional,
  quoteAsset: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const instrumentImportInputSchema =
  instrumentCreateInputSchema.merge(importerInputSchema);

export const instrumentImportFileSchema = z
  .object({
    symbol: z.string(),
    type: z.string(),
    status: z.string(),
    meta: z.string(),
    underlyingAsset: z.string(),
    quoteAsset: z.string(),
  })
  .partial();

export const instrumentUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const instrumentUpdateBodyInputSchema =
  instrumentCreateInputSchema.partial();

export interface InstrumentWithRelationships extends Instrument {
  underlyingAsset?: Asset | null;
  quoteAsset?: Asset | null;
  orders?: Order[];
  trades?: Trade[];
  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
