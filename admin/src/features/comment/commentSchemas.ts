import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Comment, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';
import { fileUploadedSchema } from 'src/features/file/fileSchemas';
import { objectToUuidSchema, objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';

extendZodWithOpenApi(z);

export const commentFindSchema = z.object({
  id: z.string(),
});

export const commentFilterFormSchema = z
  .object({
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

export const commentFilterInputSchema = commentFilterFormSchema
  .merge(
    z.object({
      user: objectToUuidSchemaOptional,
    }),
  )
  .partial();

export const commentFindManyInputSchema = z.object({
  filter: commentFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const commentDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const commentArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const commentRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const commentAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const commentAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const commentCreateInputSchema = z.object({
  body: z.string().trim().nullable().optional(),
  meta: jsonSchema.optional(),
  type: z.array(z.string()).optional(),
  images: z.array(fileUploadedSchema).optional(),
  user: objectToUuidSchema,
  importHash: z.string().optional(),
});

export const commentImportInputSchema =
  commentCreateInputSchema.merge(importerInputSchema);

export const commentImportFileSchema = z
  .object({
    body: z.string(),
    meta: z.string(),
    type: z.string().transform((val) => val?.split(' ')?.filter(Boolean) || []),
    images: z.string().transform((val) => val?.split(' ')?.filter(Boolean) || []),
    user: z.string(),
  })
  .partial();

export const commentUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const commentUpdateBodyInputSchema =
  commentCreateInputSchema.partial();

export interface CommentWithRelationships extends Comment {
  user?: Membership;
  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
