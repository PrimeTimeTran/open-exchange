import { z } from 'zod';

export type IMPORTER_STATUS = 'pending' | 'success' | 'error';

export const importerInputSchema = z.object({
  _line: z.coerce.number(),
  importHash: z.string().trim().min(1),
});

export const importerOutputSchema = z.array(
  z.object({
    _status: z.enum(['pending', 'error', 'success']),
    _line: z.coerce.number(),
    _errorMessages: z.array(z.string()).optional(),
  }),
);
