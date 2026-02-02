import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { dateTimeSchema } from 'src/shared/schemas/dateTimeSchema';
import { orderBySchema } from 'src/shared/schemas/orderBySchema';
import { z } from 'zod';

extendZodWithOpenApi(z);

export const tenantFindManyInputSchema = z.object({
  filter: z
    .object({
      name: z.string(),
      createdAtRange: z.array(dateTimeSchema).max(2),
    })
    .partial()
    .optional(),
  orderBy: orderBySchema.default({ updatedAt: 'desc' }),
  skip: z.coerce.number().optional(),
  take: z.coerce.number().optional(),
});

export const tenantCreateInputSchema = z.object({
  name: z.string().trim().min(1).max(255),
});

export const tenantDestroyInputSchema = z.object({
  id: z.string(),
});

export const tenantFindInputSchema = z.object({
  id: z.string(),
});

export const tenantUpdateParamsInputSchema = z.object({
  id: z.string(),
});

export const tenantUpdateInputSchema = tenantCreateInputSchema.partial();
