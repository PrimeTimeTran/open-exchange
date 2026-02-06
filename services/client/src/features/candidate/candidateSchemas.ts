import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { Candidate, Membership } from '@prisma/client';
import { importerInputSchema } from 'src/shared/schemas/importerSchemas';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';
import { fileUploadedSchema } from 'src/features/file/fileSchemas';
import { jsonSchema } from 'src/shared/schemas/jsonSchema';

extendZodWithOpenApi(z);

export const candidateFindSchema = z.object({
  id: z.string(),
});

export const candidateFilterFormSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    preferredName: z.string(),
    email: z.string(),
    phone: z.string(),
    country: z.string(),
    timezone: z.string(),
    linkedinUrl: z.string(),
    githubUrl: z.string(),
    portfolioUrl: z.string(),
    resumeUrl: z.string(),
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

export const candidateFilterInputSchema = candidateFilterFormSchema
  .merge(
    z.object({

    }),
  )
  .partial();

export const candidateFindManyInputSchema = z.object({
  filter: candidateFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const candidateDestroyManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const candidateArchiveManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const candidateRestoreManyInputSchema = z.object({
  ids: z.array(z.string()),
});

export const candidateAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ email: 'asc' }),
});

export const candidateAutocompleteOutputSchema = z.object({
  id: z.string(),
  email: z.string(),
});

export const candidateCreateInputSchema = z.object({
  firstName: z.string().trim().nullable().optional(),
  lastName: z.string().trim().nullable().optional(),
  preferredName: z.string().trim().nullable().optional(),
  email: z.string().trim().min(1),
  phone: z.string().trim().nullable().optional(),
  country: z.string().trim().nullable().optional(),
  timezone: z.string().trim().nullable().optional(),
  linkedinUrl: z.string().trim().nullable().optional(),
  githubUrl: z.string().trim().nullable().optional(),
  portfolioUrl: z.string().trim().nullable().optional(),
  resumeUrl: z.string().trim().nullable().optional(),
  resume: z.array(fileUploadedSchema).optional(),
  meta: jsonSchema.optional(),
  importHash: z.string().optional(),
});

export const candidateImportInputSchema =
  candidateCreateInputSchema.merge(importerInputSchema);

export const candidateImportFileSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    preferredName: z.string(),
    email: z.string(),
    phone: z.string(),
    country: z.string(),
    timezone: z.string(),
    linkedinUrl: z.string(),
    githubUrl: z.string(),
    portfolioUrl: z.string(),
    resumeUrl: z.string(),
    resume: z.string().transform((val) => val?.split(' ')?.filter(Boolean) || []),
    meta: z.string(),
  })
  .partial();

export const candidateUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const candidateUpdateBodyInputSchema =
  candidateCreateInputSchema.partial();

export interface CandidateWithRelationships extends Candidate {

  createdByMembership?: Membership;
  updatedByMembership?: Membership;
  archivedByMembership?: Membership;
}
