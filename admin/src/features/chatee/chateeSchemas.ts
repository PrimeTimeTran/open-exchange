import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Chatee, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { chateeEnumerators } from 'src/features/chatee/chateeEnumerators';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';
import { objectToUuidSchema, objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';
import { Chat } from '@prisma/client';
import { Message } from '@prisma/client';

extendZodWithOpenApi(z);

export const chateeFindSchema = z.object({
  id: z.string(),
});

export const chateeFilterFormSchema = z
  .object({
    nickname: z.string(),
    status: z.nativeEnum(chateeEnumerators.status).nullable().optional(),
    role: z.array(z.string()),
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

export const chateeFilterInputSchema = chateeFilterFormSchema
  .merge(
    z.object({

    }),
  )
  .partial();

export const chateeFindManyInputSchema = z.object({
  filter: chateeFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const chateeDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const chateeArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const chateeRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const chateeAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const chateeAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const chateeCreateInputSchema = z.object({
  nickname: z.string().trim().nullable().optional(),
  status: z.nativeEnum(chateeEnumerators.status).nullable().optional(),
  role: z.array(z.string()).optional(),
  meta: jsonSchema.optional(),
  user: objectToUuidSchemaOptional,
  chat: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const chateeImportInputSchema =
  chateeCreateInputSchema.merge(importerInputSchema);

export const chateeImportFileSchema = z
  .object({
    nickname: z.string(),
    status: z.string(),
    role: z.string().transform((val) => val?.split(' ')?.filter(Boolean) || []),
    meta: z.string(),
    user: z.string(),
    chat: z.string(),
  })
  .partial();

export const chateeUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const chateeUpdateBodyInputSchema =
  chateeCreateInputSchema.partial();

export interface ChateeWithRelationships extends Chatee {
  user?: Membership;
  chat?: Chat;
  messages?: Message[];
  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
