import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { chaterAutocompleteApiDoc } from 'src/features/chater/controllers/chaterAutocompleteController';
import { chaterCreateApiDoc } from 'src/features/chater/controllers/chaterCreateController';
import { chaterDestroyManyApiDoc } from 'src/features/chater/controllers/chaterDestroyManyController';
import { chaterFindApiDoc } from 'src/features/chater/controllers/chaterFindController';
import { chaterFindManyApiDoc } from 'src/features/chater/controllers/chaterFindManyController';
import { chaterImportApiDoc } from 'src/features/chater/controllers/chaterImporterController';
import { chaterUpdateApiDoc } from 'src/features/chater/controllers/chaterUpdateController';
import { chaterArchiveManyApiDoc } from 'src/features/chater/controllers/chaterArchiveManyController';
import { chaterRestoreManyApiDoc } from 'src/features/chater/controllers/chaterRestoreManyController';

export function chaterApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    chaterAutocompleteApiDoc,
    chaterCreateApiDoc,
    chaterArchiveManyApiDoc,
    chaterRestoreManyApiDoc,
    chaterDestroyManyApiDoc,
    chaterFindApiDoc,
    chaterFindManyApiDoc,
    chaterUpdateApiDoc,
    chaterImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Chater'],
      security,
    });
  });
}
