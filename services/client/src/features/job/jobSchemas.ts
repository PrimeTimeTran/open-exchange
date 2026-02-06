import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Job, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { jobEnumerators } from 'src/features/job/jobEnumerators';
import { numberCoerceSchema, numberOptionalCoerceSchema } from 'src/shared/schemas/numberCoerceSchema';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';

extendZodWithOpenApi(z);

export const jobFindSchema = z.object({
  id: z.string(),
});

export const jobFilterFormSchema = z
  .object({
    title: z.string(),
    team: z.string(),
    location: z.string(),
    type: z.nativeEnum(jobEnumerators.type).nullable().optional(),
    remote: z.string().nullable().optional(),
    description: z.string(),
    requirements: z.string(),
    responsibilities: z.string(),
    quantityRange: z.array(z.coerce.number()).max(2),
    salaryLowRange: z.array(z.coerce.number()).max(2),
    salaryHighRange: z.array(z.coerce.number()).max(2),
    status: z.nativeEnum(jobEnumerators.status).nullable().optional(),
    seniority: z.nativeEnum(jobEnumerators.seniority).nullable().optional(),
    currency: z.string(),
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

export const jobFilterInputSchema = jobFilterFormSchema
  .merge(
    z.object({
      remote: z.string().optional().nullable().transform((val) => val != null && val !== '' ? val === 'true' : null),
    }),
  )
  .partial();

export const jobFindManyInputSchema = z.object({
  filter: jobFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const jobDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const jobArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const jobRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const jobAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ id: 'asc' }),
});

export const jobAutocompleteOutputSchema = z.object({
  id: z.string(),
});

export const jobCreateInputSchema = z.object({
  title: z.string().trim().nullable().optional(),
  team: z.string().trim().nullable().optional(),
  location: z.string().trim().nullable().optional(),
  type: z.nativeEnum(jobEnumerators.type).nullable().optional(),
  remote: z.boolean().default(false),
  description: z.string().trim().nullable().optional(),
  requirements: z.string().trim().nullable().optional(),
  responsibilities: z.string().trim().nullable().optional(),
  quantity: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  salaryLow: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  salaryHigh: numberOptionalCoerceSchema(z.number().int().nullable().optional()),
  status: z.nativeEnum(jobEnumerators.status).nullable().optional(),
  seniority: z.nativeEnum(jobEnumerators.seniority).nullable().optional(),
  currency: z.string().trim().nullable().optional(),
  meta: jsonSchema.optional(),
  importHash: z.string().optional(),
});

export const jobImportInputSchema =
  jobCreateInputSchema.merge(importerInputSchema);

export const jobImportFileSchema = z
  .object({
    title: z.string(),
    team: z.string(),
    location: z.string(),
    type: z.string(),
    remote: z.string().transform((val) => val === 'true' || val === 'TRUE'),
    description: z.string(),
    requirements: z.string(),
    responsibilities: z.string(),
    quantity: z.string(),
    salaryLow: z.string(),
    salaryHigh: z.string(),
    status: z.string(),
    seniority: z.string(),
    currency: z.string(),
    meta: z.string(),
  })
  .partial();

export const jobUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const jobUpdateBodyInputSchema =
  jobCreateInputSchema.partial();

export interface JobWithRelationships extends Job {

  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
