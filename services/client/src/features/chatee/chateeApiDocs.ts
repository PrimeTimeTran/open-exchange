import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { chateeAutocompleteApiDoc } from 'src/features/chatee/controllers/chateeAutocompleteController';
import { chateeCreateApiDoc } from 'src/features/chatee/controllers/chateeCreateController';
import { chateeDestroyManyApiDoc } from 'src/features/chatee/controllers/chateeDestroyManyController';
import { chateeFindApiDoc } from 'src/features/chatee/controllers/chateeFindController';
import { chateeFindManyApiDoc } from 'src/features/chatee/controllers/chateeFindManyController';
import { chateeImportApiDoc } from 'src/features/chatee/controllers/chateeImporterController';
import { chateeUpdateApiDoc } from 'src/features/chatee/controllers/chateeUpdateController';
import { chateeArchiveManyApiDoc } from 'src/features/chatee/controllers/chateeArchiveManyController';
import { chateeRestoreManyApiDoc } from 'src/features/chatee/controllers/chateeRestoreManyController';

export function chateeApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    chateeAutocompleteApiDoc,
    chateeCreateApiDoc,
    chateeArchiveManyApiDoc,
    chateeRestoreManyApiDoc,
    chateeDestroyManyApiDoc,
    chateeFindApiDoc,
    chateeFindManyApiDoc,
    chateeUpdateApiDoc,
    chateeImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Chatee'],
      security,
    });
  });
}
