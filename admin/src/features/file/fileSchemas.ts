import { z } from 'zod';
import { v4 as uuid } from 'uuid';

export const fileUploadedSchema = z
  .union([
    z.string(),
    z.object({
      id: z.string(),
      filename: z.string(),
      relativeFilePath: z.string().optional(),
      sizeInBytes: z.number().optional(),
      publicUrl: z.string().optional(),
      downloadUrl: z.string().optional(),
    }),
  ])
  .transform((value) =>
    typeof value === 'string'
      ? {
          id: uuid(),
          filename: value,
          publicUrl: value,
          downloadUrl: value,
        }
      : value,
  );

export const fileCredentialsInputSchema = z.object({
  filename: z.string(),
  storageId: z.string(),
});

export const fileCredentialsOutputSchema = z.object({
  uploadCredentials: z.object({
    url: z.string(),
    publicUrl: z.string(),
    fields: z.any(),
  }),
  downloadUrl: z.string(),
  relativeFilePath: z.string(),
});

export interface FileUploaded extends z.infer<typeof fileUploadedSchema> {}
