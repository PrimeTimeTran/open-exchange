import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  fileCredentialsInputSchema,
  fileCredentialsOutputSchema,
} from 'src/features/file/fileSchemas';
import { fileStorageProvider } from 'src/features/file/fileStorageProvider';
import {
  hasStoragePermission,
  validateIsSignedInAndEmailVerified,
} from 'src/features/security';
import { storage } from 'src/features/storage';
import { AppContext } from 'src/shared/controller/appContext';
import Error403 from 'src/shared/errors/Error403';

export const fileCredentialsApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/file/credentials',
  request: {
    query: fileCredentialsInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: fileCredentialsOutputSchema,
        },
      },
    },
  },
};

export async function fileCredentialsController(
  body: unknown,
  context: AppContext,
) {
  validateIsSignedInAndEmailVerified(context);
  if (!context.currentTenant) {
    throw new Error403();
  }

  const { filename, storageId } = fileCredentialsInputSchema.parse(body);

  // @ts-ignore
  const config = storage[storageId];

  if (!config) {
    throw new Error403();
  }

  if (!hasStoragePermission(config, context)) {
    throw new Error403();
  }

  // The private URL is the path related to the bucket/file system folder
  let relativeFilePath = `${config.folder}/${filename}`;
  relativeFilePath = relativeFilePath.replace(
    ':tenantId',
    context?.currentTenant?.id || 'test',
  );
  relativeFilePath = relativeFilePath.replace(
    ':userId',
    context?.currentUser?.id || '',
  );

  const maxSizeInBytes = config.maxSizeInBytes;
  const publicRead = Boolean(config.publicRead);

  const downloadUrl = await fileStorageProvider().downloadUrl(
    relativeFilePath,
    publicRead,
  );

  /**
   * Upload Credentials has the URL and the fields to be sent
   * to the upload server.
   */
  const uploadCredentials = await fileStorageProvider().uploadCredentials(
    relativeFilePath,
    maxSizeInBytes,
    publicRead,
  );

  return {
    relativeFilePath,
    downloadUrl,
    uploadCredentials,
  };
}
