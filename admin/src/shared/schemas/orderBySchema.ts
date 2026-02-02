import { z } from 'zod';

export const orderBySchema = z.record(
  z.string(),
  z.union([
    z.enum(['asc', 'desc']),
    z.record(z.string(), z.enum(['asc', 'desc'])),
    z.record(z.string(), z.record(z.string(), z.enum(['asc', 'desc']))),
  ]),
);
