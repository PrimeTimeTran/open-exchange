import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Item, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { numberCoerceSchema, numberOptionalCoerceSchema } from 'src/shared/schemas/numberCoerceSchema';
import { fileUploadedSchema } from 'src/features/file/fileSchemas';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';

extendZodWithOpenApi(z);

export const itemFindSchema = z.object({
  id: z.string(),
});

export const itemFilterFormSchema = z
  .object({
    name: z.string(),
    caption: z.string(),
    description: z.string(),
    priceRange: z.array(z.coerce.number()).max(2),
    category: z.array(z.string()),
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

export const itemFilterInputSchema = itemFilterFormSchema
  .merge(
    z.object({

    }),
  )
  .partial();

export const itemFindManyInputSchema = z.object({
  filter: itemFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const itemDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const itemArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const itemRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const itemAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const itemAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const itemCreateInputSchema = z.object({
  name: z.string().trim().nullable().optional(),
  caption: z.string().trim().nullable().optional(),
  description: z.string().trim().nullable().optional(),
  price: numberOptionalCoerceSchema(z.number().nullable().optional()),
  photos: z.array(fileUploadedSchema).optional(),
  category: z.array(z.string()).optional(),
  meta: jsonSchema.optional(),
  files: z.array(fileUploadedSchema).optional(),
  importHash: z.string().optional(),
});

export const itemImportInputSchema =
  itemCreateInputSchema.merge(importerInputSchema);

export const itemImportFileSchema = z
  .object({
    name: z.string(),
    caption: z.string(),
    description: z.string(),
    price: z.string(),
    photos: z.string().transform((val) => val?.split(' ')?.filter(Boolean) || []),
    category: z.string().transform((val) => val?.split(' ')?.filter(Boolean) || []),
    meta: z.string(),
    files: z.string().transform((val) => val?.split(' ')?.filter(Boolean) || []),
  })
  .partial();

export const itemUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const itemUpdateBodyInputSchema =
  itemCreateInputSchema.partial();

export interface ItemWithRelationships extends Item {

  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
