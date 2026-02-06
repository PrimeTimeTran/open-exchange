import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Listing, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { dateSchema, dateOptionalSchema } from 'src/shared/schemas/dateSchema';
import { listingEnumerators } from 'src/features/listing/listingEnumerators';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';

extendZodWithOpenApi(z);

export const listingFindSchema = z.object({
  id: z.string(),
});

export const listingFilterFormSchema = z
  .object({
    companyName: z.string(),
    legalName: z.string(),
    jurisdiction: z.string(),
    incorporationDateRange: z.array(dateOptionalSchema).max(2),
    website: z.string(),
    assetSymbol: z.string(),
    assetClass: z.nativeEnum(listingEnumerators.assetClass).nullable().optional(),
    status: z.nativeEnum(listingEnumerators.status).nullable().optional(),
    submittedAtRange: z.array(dateOptionalSchema).max(2),
    decisionAtRange: z.array(dateOptionalSchema).max(2),
    kycCompleted: z.string().nullable().optional(),
    docsSubmitted: z.string().nullable().optional(),
    riskDisclosureUrl: z.string(),
    primaryContactName: z.string(),
    primaryContactEmail: z.string(),
    reviewedBy: z.string(),
    notes: z.string(),
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

export const listingFilterInputSchema = listingFilterFormSchema
  .merge(
    z.object({
      kycCompleted: z.string().optional().nullable().transform((val) => val != null && val !== '' ? val === 'true' : null),
      docsSubmitted: z.string().optional().nullable().transform((val) => val != null && val !== '' ? val === 'true' : null),
    }),
  )
  .partial();

export const listingFindManyInputSchema = z.object({
  filter: listingFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const listingDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const listingArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const listingRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const listingAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ assetSymbol: 'asc' }),
});

export const listingAutocompleteOutputSchema = z.object({
  id: z.string(),
  assetSymbol: z.string(),
});

export const listingCreateInputSchema = z.object({
  companyName: z.string().trim().nullable().optional(),
  legalName: z.string().trim().nullable().optional(),
  jurisdiction: z.string().trim().nullable().optional(),
  incorporationDate: dateOptionalSchema,
  website: z.string().trim().nullable().optional(),
  assetSymbol: z.string().trim().min(1),
  assetClass: z.nativeEnum(listingEnumerators.assetClass).nullable().optional(),
  status: z.nativeEnum(listingEnumerators.status).nullable().optional(),
  submittedAt: dateOptionalSchema,
  decisionAt: dateOptionalSchema,
  kycCompleted: z.boolean().default(false),
  docsSubmitted: z.boolean().default(false),
  riskDisclosureUrl: z.string().trim().nullable().optional(),
  primaryContactName: z.string().trim().nullable().optional(),
  primaryContactEmail: z.string().trim().nullable().optional(),
  reviewedBy: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
  meta: jsonSchema.optional(),
  importHash: z.string().optional(),
});

export const listingImportInputSchema =
  listingCreateInputSchema.merge(importerInputSchema);

export const listingImportFileSchema = z
  .object({
    companyName: z.string(),
    legalName: z.string(),
    jurisdiction: z.string(),
    incorporationDate: z.string(),
    website: z.string(),
    assetSymbol: z.string(),
    assetClass: z.string(),
    status: z.string(),
    submittedAt: z.string(),
    decisionAt: z.string(),
    kycCompleted: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    docsSubmitted: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    riskDisclosureUrl: z.string(),
    primaryContactName: z.string(),
    primaryContactEmail: z.string(),
    reviewedBy: z.string(),
    notes: z.string(),
    meta: z.string(),
  })
  .partial();

export const listingUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const listingUpdateBodyInputSchema =
  listingCreateInputSchema.partial();

export interface ListingWithRelationships extends Listing {

  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
