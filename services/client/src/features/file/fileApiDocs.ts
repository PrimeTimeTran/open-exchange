import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { fileCredentialsApiDoc } from 'src/features/file/controllers/fileCredentialsController';

export function fileApiDocs(registry: OpenAPIRegistry, security: any) {
  [fileCredentialsApiDoc].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['File'],
      security,
    });
  });
}
