import { ZodSchema, z } from 'zod';

export const numberCoerceSchema = (schema: ZodSchema) =>
  z
    .union([z.string().nonempty(), z.number()])
    .transform((x) => Number(x))
    .pipe(schema);

export const numberOptionalCoerceSchema = (schema: ZodSchema) =>
  z
    .union([z.string().optional().nullable(), z.number().optional().nullable()])
    .transform((x) => {
      const parsed =
        x === null || x === '' ? null : x === undefined ? undefined : Number(x);

      return parsed;
    })
    .pipe(schema);
