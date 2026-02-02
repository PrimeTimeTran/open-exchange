import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { LedgerEvent, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { ledgerEventEnumerators } from 'src/features/ledgerEvent/ledgerEventEnumerators';
import { objectToUuidSchema, objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';
import { LedgerEntry } from '@prisma/client';

extendZodWithOpenApi(z);

export const ledgerEventFindSchema = z.object({
  id: z.string(),
});

export const ledgerEventFilterFormSchema = z
  .object({
    type: z.nativeEnum(ledgerEventEnumerators.type).nullable().optional(),
    referenceType: z.nativeEnum(ledgerEventEnumerators.referenceType).nullable().optional(),
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

export const ledgerEventFilterInputSchema = ledgerEventFilterFormSchema
  .merge(
    z.object({

    }),
  )
  .partial();

export const ledgerEventFindManyInputSchema = z.object({
  filter: ledgerEventFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const ledgerEventDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const ledgerEventArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const ledgerEventRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const ledgerEventAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const ledgerEventAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const ledgerEventCreateInputSchema = z.object({
  type: z.nativeEnum(ledgerEventEnumerators.type).nullable().optional(),
  referenceType: z.nativeEnum(ledgerEventEnumerators.referenceType).nullable().optional(),
  importHash: z.string().optional(),
});

export const ledgerEventImportInputSchema =
  ledgerEventCreateInputSchema.merge(importerInputSchema);

export const ledgerEventImportFileSchema = z
  .object({
    type: z.string(),
    referenceType: z.string(),
  })
  .partial();

export const ledgerEventUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const ledgerEventUpdateBodyInputSchema =
  ledgerEventCreateInputSchema.partial();

export interface LedgerEventWithRelationships extends LedgerEvent {
  entries?: LedgerEntry[];
  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
