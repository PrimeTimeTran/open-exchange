import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Chat, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { fileUploadedSchema } from 'src/features/file/fileSchemas';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';
import { objectToUuidSchema, objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';
import { Message } from '@prisma/client';
import { Chatee } from '@prisma/client';

extendZodWithOpenApi(z);

export const chatFindSchema = z.object({
  id: z.string(),
});

export const chatFilterFormSchema = z
  .object({
    name: z.string(),
    active: z.string().nullable().optional(),
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

export const chatFilterInputSchema = chatFilterFormSchema
  .merge(
    z.object({
      active: z.string().optional().nullable().transform((val) => val != null && val !== '' ? val === 'true' : null),
    }),
  )
  .partial();

export const chatFindManyInputSchema = z.object({
  filter: chatFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const chatDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const chatArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const chatRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const chatAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const chatAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const chatCreateInputSchema = z.object({
  name: z.string().trim().nullable().optional(),
  media: z.array(fileUploadedSchema).optional(),
  meta: jsonSchema.optional(),
  active: z.boolean().default(false),
  importHash: z.string().optional(),
});

export const chatImportInputSchema =
  chatCreateInputSchema.merge(importerInputSchema);

export const chatImportFileSchema = z
  .object({
    name: z.string(),
    media: z.string().transform((val) => val?.split(' ')?.filter(Boolean) || []),
    meta: z.string(),
    active: z.string().transform((val) => val === 'true' || val === 'TRUE'),
  })
  .partial();

export const chatUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const chatUpdateBodyInputSchema =
  chatCreateInputSchema.partial();

export interface ChatWithRelationships extends Chat {
  messages?: Message[];
  chatees?: Chatee[];
  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
