import { isString } from 'lodash';
import { z } from 'zod';

export const objectToUuidSchema = z
  .union([
    z.string().nullable().optional(),
    z.object({ id: z.string().nullable().optional() }),
  ])
  .transform((rel) => (isString(rel) ? rel : rel?.id))
  .pipe(z.string().uuid());

export const objectToUuidSchemaOptional = z
  .union([z.string().uuid(), z.object({ id: z.string().uuid() })])
  .optional()
  .nullable()
  .transform((rel) =>
    rel !== undefined ? (isString(rel) ? rel : rel?.id || null) : undefined,
  );
