import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { SystemAccount, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { systemAccountEnumerators } from 'src/features/systemAccount/systemAccountEnumerators';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';

extendZodWithOpenApi(z);

export const systemAccountFindSchema = z.object({
  id: z.string(),
});

export const systemAccountFilterFormSchema = z
  .object({
    type: z.nativeEnum(systemAccountEnumerators.type).nullable().optional(),
    name: z.string(),
    description: z.string(),
    isActive: z.string().nullable().optional(),
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

export const systemAccountFilterInputSchema = systemAccountFilterFormSchema
  .merge(
    z.object({
      isActive: z.string().optional().nullable().transform((val) => val != null && val !== '' ? val === 'true' : null),
    }),
  )
  .partial();

export const systemAccountFindManyInputSchema = z.object({
  filter: systemAccountFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const systemAccountDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const systemAccountArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const systemAccountRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const systemAccountAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const systemAccountAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const systemAccountCreateInputSchema = z.object({
  type: z.nativeEnum(systemAccountEnumerators.type).nullable().optional(),
  name: z.string().trim().nullable().optional(),
  description: z.string().trim().nullable().optional(),
  isActive: z.boolean().default(false),
  meta: jsonSchema.optional(),
  importHash: z.string().optional(),
});

export const systemAccountImportInputSchema =
  systemAccountCreateInputSchema.merge(importerInputSchema);

export const systemAccountImportFileSchema = z
  .object({
    type: z.string(),
    name: z.string(),
    description: z.string(),
    isActive: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    meta: z.string(),
  })
  .partial();

export const systemAccountUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const systemAccountUpdateBodyInputSchema =
  systemAccountCreateInputSchema.partial();

export interface SystemAccountWithRelationships extends SystemAccount {

  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
