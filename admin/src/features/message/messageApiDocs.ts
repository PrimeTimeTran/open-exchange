import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { messageAutocompleteApiDoc } from 'src/features/message/controllers/messageAutocompleteController';
import { messageCreateApiDoc } from 'src/features/message/controllers/messageCreateController';
import { messageDestroyManyApiDoc } from 'src/features/message/controllers/messageDestroyManyController';
import { messageFindApiDoc } from 'src/features/message/controllers/messageFindController';
import { messageFindManyApiDoc } from 'src/features/message/controllers/messageFindManyController';
import { messageImportApiDoc } from 'src/features/message/controllers/messageImporterController';
import { messageUpdateApiDoc } from 'src/features/message/controllers/messageUpdateController';
import { messageArchiveManyApiDoc } from 'src/features/message/controllers/messageArchiveManyController';
import { messageRestoreManyApiDoc } from 'src/features/message/controllers/messageRestoreManyController';

export function messageApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    messageAutocompleteApiDoc,
    messageCreateApiDoc,
    messageArchiveManyApiDoc,
    messageRestoreManyApiDoc,
    messageDestroyManyApiDoc,
    messageFindApiDoc,
    messageFindManyApiDoc,
    messageUpdateApiDoc,
    messageImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Message'],
      security,
    });
  });
}
