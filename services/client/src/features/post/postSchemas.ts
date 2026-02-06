import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Post, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { fileUploadedSchema } from 'src/features/file/fileSchemas';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';
import { objectToUuidSchema, objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';

extendZodWithOpenApi(z);

export const postFindSchema = z.object({
  id: z.string(),
});

export const postFilterFormSchema = z
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

export const postFilterInputSchema = postFilterFormSchema
  .merge(
    z.object({
      user: objectToUuidSchemaOptional,
    }),
  )
  .partial();

export const postFindManyInputSchema = z.object({
  filter: postFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const postDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const postArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const postRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const postAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const postAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const postCreateInputSchema = z.object({
  title: z.string().trim().nullable().optional(),
  body: z.string().trim().nullable().optional(),
  files: z.array(fileUploadedSchema).optional(),
  images: z.array(fileUploadedSchema).optional(),
  type: z.array(z.string()).optional(),
  meta: jsonSchema.optional(),
  user: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const postImportInputSchema =
  postCreateInputSchema.merge(importerInputSchema);

export const postImportFileSchema = z
  .object({
    title: z.string(),
    body: z.string(),
    files: z.string().transform((val) => val?.split(' ')?.filter(Boolean) || []),
    images: z.string().transform((val) => val?.split(' ')?.filter(Boolean) || []),
    type: z.string().transform((val) => val?.split(' ')?.filter(Boolean) || []),
    meta: z.string(),
    user: z.string(),
  })
  .partial();

export const postUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const postUpdateBodyInputSchema =
  postCreateInputSchema.partial();

export interface PostWithRelationships extends Post {
  user?: Membership;
  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
