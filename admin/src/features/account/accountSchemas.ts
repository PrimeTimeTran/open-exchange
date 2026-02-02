import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Account, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { accountEnumerators } from 'src/features/account/accountEnumerators';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';
import { objectToUuidSchema, objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';
import { Order } from '@prisma/client';

extendZodWithOpenApi(z);

export const accountFindSchema = z.object({
  id: z.string(),
});

export const accountFilterFormSchema = z
  .object({
    type: z.nativeEnum(accountEnumerators.type).nullable().optional(),
    status: z.nativeEnum(accountEnumerators.status).nullable().optional(),
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

export const accountFilterInputSchema = accountFilterFormSchema
  .merge(
    z.object({

    }),
  )
  .partial();

export const accountFindManyInputSchema = z.object({
  filter: accountFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const accountDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const accountArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const accountRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const accountAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const accountAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const accountCreateInputSchema = z.object({
  type: z.nativeEnum(accountEnumerators.type).nullable().optional(),
  status: z.nativeEnum(accountEnumerators.status).nullable().optional(),
  meta: jsonSchema.optional(),
  importHash: z.string().optional(),
});

export const accountImportInputSchema =
  accountCreateInputSchema.merge(importerInputSchema);

export const accountImportFileSchema = z
  .object({
    type: z.string(),
    status: z.string(),
    meta: z.string(),
  })
  .partial();

export const accountUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const accountUpdateBodyInputSchema =
  accountCreateInputSchema.partial();

export interface AccountWithRelationships extends Account {
  orders?: Order[];
  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
