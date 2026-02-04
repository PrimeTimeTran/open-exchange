import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { apiKeyAutocompleteApiDoc } from 'src/features/apiKey/controllers/apiKeyAutocompleteController';
import { apiKeyCreateApiDoc } from 'src/features/apiKey/controllers/apiKeyCreateController';
import { apiKeyDestroyApiDoc } from 'src/features/apiKey/controllers/apiKeyDestroyController';
import { apiKeyFindManyApiDoc } from 'src/features/apiKey/controllers/apiKeyFindManyController';
import { apiKeyUpdateApiDoc } from 'src/features/apiKey/controllers/apiKeyUpdateController';
import { z } from 'zod';

export function apiKeyApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    apiKeyAutocompleteApiDoc,
    apiKeyCreateApiDoc,
    apiKeyDestroyApiDoc,
    apiKeyFindManyApiDoc,
    apiKeyUpdateApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Api Key'],
      security,
    });
  });
}
