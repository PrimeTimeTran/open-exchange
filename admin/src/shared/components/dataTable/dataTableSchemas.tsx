import { z } from 'zod';

export const dataTableSortSchema = z.array(
  z.object({
    id: z.string(),
    desc: z.string().transform((value) => value === 'true'),
  }),
);

export type DataTableSort = z.infer<typeof dataTableSortSchema>;
