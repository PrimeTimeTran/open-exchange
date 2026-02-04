import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { LedgerEntry, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { numberCoerceSchema, numberOptionalCoerceSchema } from 'src/shared/schemas/numberCoerceSchema';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';
import { objectToUuidSchema, objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';
import { LedgerEvent } from '@prisma/client';

extendZodWithOpenApi(z);

export const ledgerEntryFindSchema = z.object({
  id: z.string(),
});

export const ledgerEntryFilterFormSchema = z
  .object({
    amountRange: z.array(z.coerce.number()).max(2),
    accountId: z.string(),
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

export const ledgerEntryFilterInputSchema = ledgerEntryFilterFormSchema
  .merge(
    z.object({

    }),
  )
  .partial();

export const ledgerEntryFindManyInputSchema = z.object({
  filter: ledgerEntryFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const ledgerEntryDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const ledgerEntryArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const ledgerEntryRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const ledgerEntryAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const ledgerEntryAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const ledgerEntryCreateInputSchema = z.object({
  amount: numberOptionalCoerceSchema(z.number().nullable().optional()),
  accountId: z.string().trim().nullable().optional(),
  meta: jsonSchema.optional(),
  event: objectToUuidSchemaOptional,
  importHash: z.string().optional(),
});

export const ledgerEntryImportInputSchema =
  ledgerEntryCreateInputSchema.merge(importerInputSchema);

export const ledgerEntryImportFileSchema = z
  .object({
    amount: z.string(),
    accountId: z.string(),
    meta: z.string(),
    event: z.string(),
  })
  .partial();

export const ledgerEntryUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const ledgerEntryUpdateBodyInputSchema =
  ledgerEntryCreateInputSchema.partial();

export interface LedgerEntryWithRelationships extends LedgerEntry {
  event?: LedgerEvent;
  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
