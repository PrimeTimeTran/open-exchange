import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Message, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { fileUploadedSchema } from 'src/features/file/fileSchemas';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';
import { objectToUuidSchema, objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';
import { Chat } from '@prisma/client';
import { Chatee } from '@prisma/client';

extendZodWithOpenApi(z);

export const messageFindSchema = z.object({
  id: z.string(),
});

export const messageFilterFormSchema = z
  .object({
    body: z.string(),
    type: z.array(z.string()),
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

export const messageFilterInputSchema = messageFilterFormSchema
  .merge(
    z.object({

    }),
  )
  .partial();

export const messageFindManyInputSchema = z.object({
  filter: messageFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const messageDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const messageArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const messageRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const messageAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const messageAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const messageCreateInputSchema = z.object({
  body: z.string().trim().nullable().optional(),
  attachment: z.array(fileUploadedSchema).optional(),
  images: z.array(fileUploadedSchema).optional(),
  type: z.array(z.string()).optional(),
  meta: jsonSchema.optional(),
  chat: objectToUuidSchemaOptional,
  chatee: objectToUuidSchemaOptional,
  sender: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const messageImportInputSchema =
  messageCreateInputSchema.merge(importerInputSchema);

export const messageImportFileSchema = z
  .object({
    body: z.string(),
    attachment: z.string().transform((val) => val?.split(' ')?.filter(Boolean) || []),
    images: z.string().transform((val) => val?.split(' ')?.filter(Boolean) || []),
    type: z.string().transform((val) => val?.split(' ')?.filter(Boolean) || []),
    meta: z.string(),
    chat: z.string(),
    chatee: z.string(),
    sender: z.string(),
  })
  .partial();

export const messageUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const messageUpdateBodyInputSchema =
  messageCreateInputSchema.partial();

export interface MessageWithRelationships extends Message {
  chat?: Chat;
  chatee?: Chatee;
  sender?: Membership;
  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
