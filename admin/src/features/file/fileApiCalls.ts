import { fileCredentialsOutputSchema } from 'src/features/file/fileSchemas';
import { ApiErrorPayload } from 'src/shared/errors/ApiErrorPayload';
import { objectToQuery } from 'src/shared/lib/objectToQuery';
import { z } from 'zod';

export async function fileCredentialsApiCall(
  filename: string,
  storageId: string,
) {
  const response = await fetch(
    `${
      process.env.NEXT_PUBLIC_BACKEND_URL || '' || ''
    }/api/file/credentials?${objectToQuery({
      filename: filename,
      storageId,
    })}`,
  );

  if (!response.ok) {
    const payload = (await response.json()) as ApiErrorPayload;
    throw new Error(payload.errors?.[0]?.message);
  }

  return (await response.json()) as z.infer<typeof fileCredentialsOutputSchema>;
}
