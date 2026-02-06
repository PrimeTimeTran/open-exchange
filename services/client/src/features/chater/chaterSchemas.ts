import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Chater, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { chaterEnumerators } from 'src/features/chater/chaterEnumerators';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';
import { objectToUuidSchema, objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';
import { Chat } from '@prisma/client';
import { Message } from '@prisma/client';

extendZodWithOpenApi(z);

export const chaterFindSchema = z.object({
  id: z.string(),
});

export const chaterFilterFormSchema = z
  .object({
    nickname: z.string(),
    status: z.nativeEnum(chaterEnumerators.status).nullable().optional(),
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

export const chaterFilterInputSchema = chaterFilterFormSchema
  .merge(
    z.object({

    }),
  )
  .partial();

export const chaterFindManyInputSchema = z.object({
  filter: chaterFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const chaterDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const chaterArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const chaterRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const chaterAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const chaterAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const chaterCreateInputSchema = z.object({
  nickname: z.string().trim().nullable().optional(),
  status: z.nativeEnum(chaterEnumerators.status).nullable().optional(),
  role: z.array(z.string()).optional(),
  meta: jsonSchema.optional(),
  user: objectToUuidSchemaOptional,
  chat: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const chaterImportInputSchema =
  chaterCreateInputSchema.merge(importerInputSchema);

export const chaterImportFileSchema = z
  .object({
    nickname: z.string(),
    status: z.string(),
    role: z.string().transform((val) => val?.split(' ')?.filter(Boolean) || []),
    meta: z.string(),
    user: z.string(),
    chat: z.string(),
  })
  .partial();

export const chaterUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const chaterUpdateBodyInputSchema =
  chaterCreateInputSchema.partial();

export interface ChaterWithRelationships extends Chater {
  user?: Membership;
  chat?: Chat;
  messages?: Message[];
  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
