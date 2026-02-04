import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Feedback, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { fileUploadedSchema } from 'src/features/file/fileSchemas';
import { feedbackEnumerators } from 'src/features/feedback/feedbackEnumerators';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';
import { objectToUuidSchema, objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';

extendZodWithOpenApi(z);

export const feedbackFindSchema = z.object({
  id: z.string(),
});

export const feedbackFilterFormSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    type: z.nativeEnum(feedbackEnumerators.type).nullable().optional(),
    status: z.nativeEnum(feedbackEnumerators.status).nullable().optional(),
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

export const feedbackFilterInputSchema = feedbackFilterFormSchema
  .merge(
    z.object({

    }),
  )
  .partial();

export const feedbackFindManyInputSchema = z.object({
  filter: feedbackFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const feedbackDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const feedbackArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const feedbackRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const feedbackAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const feedbackAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const feedbackCreateInputSchema = z.object({
  title: z.string().trim().nullable().optional(),
  description: z.string().trim().nullable().optional(),
  attachments: z.array(fileUploadedSchema).optional(),
  type: z.nativeEnum(feedbackEnumerators.type).nullable().optional(),
  status: z.nativeEnum(feedbackEnumerators.status).nullable().optional(),
  json: jsonSchema.optional(),
  user: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const feedbackImportInputSchema =
  feedbackCreateInputSchema.merge(importerInputSchema);

export const feedbackImportFileSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    attachments: z.string().transform((val) => val?.split(' ')?.filter(Boolean) || []),
    type: z.string(),
    status: z.string(),
    json: z.string(),
    user: z.string(),
  })
  .partial();

export const feedbackUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const feedbackUpdateBodyInputSchema =
  feedbackCreateInputSchema.partial();

export interface FeedbackWithRelationships extends Feedback {
  user?: Membership;
  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
