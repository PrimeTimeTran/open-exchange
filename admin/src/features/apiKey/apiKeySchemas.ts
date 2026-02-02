import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { ApiKey } from '@prisma/client';
import { MembershipWithUser } from 'src/features/membership/membershipSchemas';
import { dateTimeOptionalSchema } from 'src/shared/schemas/dateTimeSchema';
import { objectToUuidSchemaOptional } from 'src/shared/schemas/objectToUuidSchema';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { formatTranslation } from 'src/translation/formatTranslation';
import { Dictionary } from 'src/translation/locales';
import { z } from 'zod';

extendZodWithOpenApi(z);

export function apiKeyCreateInputSchema(
  availableScopes?: string[],
  dictionary?: Dictionary,
) {
  if (!availableScopes) {
    return z.object({
      name: z.string().trim().min(1).max(255),
      scopes: z.array(z.string()),
      expiresAt: dateTimeOptionalSchema,
    });
  }

  if (!dictionary) {
    throw new Error('dictionary is required');
  }

  return z.object({
    name: z.string().trim().min(1).max(255),
    scopes: z.array(
      z.string().refine((val) => availableScopes.includes(val), {
        message: dictionary.apiKey.errors.invalidScopes,
      }),
    ),
    expiresAt: dateTimeOptionalSchema
      .pipe(
        z
          .date()
          .min(
            new Date(),
            formatTranslation(
              dictionary.shared.errors.dateFuture,
              dictionary.apiKey.fields.expiresAt,
            ),
          ),
      )
      .nullable(),
  });
}

export const apiKeyCreateOutputSchema = z.object({
  apiKey: z.string(),
});

export const apiKeyAutocompleteInputSchema = z.object({
  search: z.string().trim().optional(),
  exclude: z.array(z.string().uuid()).optional(),
  take: z.coerce.number().optional(),
  orderBy: orderBySchema.default({ name: 'asc' }),
});

export const apiKeyAutocompleteOutputSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    keyPrefix: z.string(),
    email: z.string(),
  }),
);

export const apiKeyDestroyInputSchema = z.object({
  id: z.string(),
});

export const apiKeyFilterFormSchema = z
  .object({
    id: z.string().uuid().nullable().optional(),
    membership: z.any(),
  })
  .partial();

export const apiKeyFilterInputSchema = apiKeyFilterFormSchema
  .merge(
    z.object({
      membership: objectToUuidSchemaOptional,
    }),
  )
  .partial();

export const apiKeyFindManyInputSchema = z.object({
  filter: apiKeyFilterInputSchema.partial().optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const apiKeyUpdateParamsSchema = z.object({
  id: z.string(),
});

export function apiKeyUpdateInputSchema(
  availableScopes?: string[],
  dictionary?: Dictionary,
) {
  if (!availableScopes) {
    return z.object({
      name: z.string().trim().min(1).max(255),
      scopes: z.array(z.string()),
      expiresAt: dateTimeOptionalSchema,
      disabled: z.boolean(),
    });
  }

  if (!dictionary) {
    throw new Error('dictionary is required');
  }

  return z.object({
    name: z.string().trim().min(1).max(255),
    scopes: z.array(
      z.string().refine((val) => availableScopes.includes(val), {
        message: dictionary.apiKey.errors.invalidScopes,
      }),
    ),
    expiresAt: dateTimeOptionalSchema,
    disabled: z.boolean(),
  });
}

export interface ApiKeyWithMembership extends ApiKey {
  membership?: Partial<MembershipWithUser>;
}
