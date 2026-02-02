import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { chatAutocompleteApiDoc } from 'src/features/chat/controllers/chatAutocompleteController';
import { chatCreateApiDoc } from 'src/features/chat/controllers/chatCreateController';
import { chatDestroyManyApiDoc } from 'src/features/chat/controllers/chatDestroyManyController';
import { chatFindApiDoc } from 'src/features/chat/controllers/chatFindController';
import { chatFindManyApiDoc } from 'src/features/chat/controllers/chatFindManyController';
import { chatImportApiDoc } from 'src/features/chat/controllers/chatImporterController';
import { chatUpdateApiDoc } from 'src/features/chat/controllers/chatUpdateController';
import { chatArchiveManyApiDoc } from 'src/features/chat/controllers/chatArchiveManyController';
import { chatRestoreManyApiDoc } from 'src/features/chat/controllers/chatRestoreManyController';

export function chatApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    chatAutocompleteApiDoc,
    chatCreateApiDoc,
    chatArchiveManyApiDoc,
    chatRestoreManyApiDoc,
    chatDestroyManyApiDoc,
    chatFindApiDoc,
    chatFindManyApiDoc,
    chatUpdateApiDoc,
    chatImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Chat'],
      security,
    });
  });
}
