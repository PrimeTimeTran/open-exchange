import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Article, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';
import { fileUploadedSchema } from 'src/features/file/fileSchemas';
import { objectToUuidSchema, objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';

extendZodWithOpenApi(z);

export const articleFindSchema = z.object({
  id: z.string(),
});

export const articleFilterFormSchema = z
  .object({
    title: z.string(),
    body: z.string(),
    type: z.array(z.string()),
    user: z.any(),
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

export const articleFilterInputSchema = articleFilterFormSchema
  .merge(
    z.object({
      user: objectToUuidSchemaOptional,
    }),
  )
  .partial();

export const articleFindManyInputSchema = z.object({
  filter: articleFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const articleDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const articleArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const articleRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const articleAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const articleAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const articleCreateInputSchema = z.object({
  title: z.string().trim().nullable().optional(),
  body: z.string().trim().nullable().optional(),
  meta: jsonSchema.optional(),
  type: z.array(z.string()).optional(),
  images: z.array(fileUploadedSchema).optional(),
  files: z.array(fileUploadedSchema).optional(),
  user: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const articleImportInputSchema =
  articleCreateInputSchema.merge(importerInputSchema);

export const articleImportFileSchema = z
  .object({
    title: z.string(),
    body: z.string(),
    meta: z.string(),
    type: z.string().transform((val) => val?.split(' ')?.filter(Boolean) || []),
    images: z.string().transform((val) => val?.split(' ')?.filter(Boolean) || []),
    files: z.string().transform((val) => val?.split(' ')?.filter(Boolean) || []),
    user: z.string(),
  })
  .partial();

export const articleUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const articleUpdateBodyInputSchema =
  articleCreateInputSchema.partial();

export interface ArticleWithRelationships extends Article {
  user?: Membership;
  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
