import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { MarketMaker, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { marketMakerEnumerators } from 'src/features/marketMaker/marketMakerEnumerators';
import { numberCoerceSchema, numberOptionalCoerceSchema } from 'src/shared/schemas/numberCoerceSchema';
import { dateTimeSchema, dateTimeOptionalSchema } from 'src/shared/schemas/dateTimeSchema';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';

extendZodWithOpenApi(z);

export const marketMakerFindSchema = z.object({
  id: z.string(),
});

export const marketMakerFilterFormSchema = z
  .object({
    organizationName: z.string(),
    contactEmail: z.string(),
    contactPhone: z.string(),
    status: z.nativeEnum(marketMakerEnumerators.status).nullable().optional(),
    tier: z.nativeEnum(marketMakerEnumerators.tier).nullable().optional(),
    marketsSupported: z.string(),
    minQuoteSizeRange: z.array(z.coerce.number()).max(2),
    maxQuoteSizeRange: z.array(z.coerce.number()).max(2),
    spreadLimitRange: z.array(z.coerce.number()).max(2),
    quoteObligation: z.string().nullable().optional(),
    dailyVolumeTargetRange: z.array(z.coerce.number()).max(2),
    makerFeeRange: z.array(z.coerce.number()).max(2),
    takerFeeRange: z.array(z.coerce.number()).max(2),
    rebateRateRange: z.array(z.coerce.number()).max(2),
    rebateBalanceRange: z.array(z.coerce.number()).max(2),
    apiAccess: z.string().nullable().optional(),
    maxOrdersPerSecondRange: z.array(z.coerce.number()).max(2),
    directMarketAccess: z.string().nullable().optional(),
    contractSignedAtRange: z.array(dateTimeOptionalSchema).max(2),
    obligationViolationCountRange: z.array(z.coerce.number()).max(2),
    notesInternal: z.string(),
    specialOrderTypes: z.nativeEnum(marketMakerEnumerators.specialOrderTypes).nullable().optional(),
    minFeeAmountRange: z.array(z.coerce.number()).max(2),
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

export const marketMakerFilterInputSchema = marketMakerFilterFormSchema
  .merge(
    z.object({
      quoteObligation: z.string().optional().nullable().transform((val) => val != null && val !== '' ? val === 'true' : null),
      apiAccess: z.string().optional().nullable().transform((val) => val != null && val !== '' ? val === 'true' : null),
      directMarketAccess: z.string().optional().nullable().transform((val) => val != null && val !== '' ? val === 'true' : null),
    }),
  )
  .partial();

export const marketMakerFindManyInputSchema = z.object({
  filter: marketMakerFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const marketMakerDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const marketMakerArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const marketMakerRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const marketMakerAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ organizationName: 'asc' }),
});

export const marketMakerAutocompleteOutputSchema = z.object({
  id: z.string(),
  organizationName: z.string(),
});

export const marketMakerCreateInputSchema = z.object({
  organizationName: z.string().trim().min(1),
  contactEmail: z.string().trim().nullable().optional(),
  contactPhone: z.string().trim().nullable().optional(),
  status: z.nativeEnum(marketMakerEnumerators.status).nullable().optional(),
  tier: z.nativeEnum(marketMakerEnumerators.tier).nullable().optional(),
  marketsSupported: z.string().trim().nullable().optional(),
  minQuoteSize: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  maxQuoteSize: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  spreadLimit: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  quoteObligation: z.boolean().default(false),
  dailyVolumeTarget: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  makerFee: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  takerFee: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  rebateRate: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  rebateBalance: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  apiAccess: z.boolean().default(false),
  maxOrdersPerSecond: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  directMarketAccess: z.boolean().default(false),
  contractSignedAt: dateTimeOptionalSchema,
  obligationViolationCount: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  auditLog: jsonSchema.optional(),
  notesInternal: z.string().trim().nullable().optional(),
  specialOrderTypes: z.nativeEnum(marketMakerEnumerators.specialOrderTypes).nullable().optional(),
  minFeeAmount: numberOptionalCoerceSchema(z.number().nullable().optional()),
  importHash: z.string().optional(),
});

export const marketMakerImportInputSchema =
  marketMakerCreateInputSchema.merge(importerInputSchema);

export const marketMakerImportFileSchema = z
  .object({
    organizationName: z.string(),
    contactEmail: z.string(),
    contactPhone: z.string(),
    status: z.string(),
    tier: z.string(),
    marketsSupported: z.string(),
    minQuoteSize: z.string(),
    maxQuoteSize: z.string(),
    spreadLimit: z.string(),
    quoteObligation: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    dailyVolumeTarget: z.string(),
    makerFee: z.string(),
    takerFee: z.string(),
    rebateRate: z.string(),
    rebateBalance: z.string(),
    apiAccess: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    maxOrdersPerSecond: z.string(),
    directMarketAccess: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    contractSignedAt: z.string(),
    obligationViolationCount: z.string(),
    auditLog: z.string(),
    notesInternal: z.string(),
    specialOrderTypes: z.string(),
    minFeeAmount: z.string(),
  })
  .partial();

export const marketMakerUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const marketMakerUpdateBodyInputSchema =
  marketMakerCreateInputSchema.partial();

export interface MarketMakerWithRelationships extends MarketMaker {

  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
