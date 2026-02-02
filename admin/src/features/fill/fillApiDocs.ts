import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { fillAutocompleteApiDoc } from 'src/features/fill/controllers/fillAutocompleteController';
import { fillCreateApiDoc } from 'src/features/fill/controllers/fillCreateController';
import { fillDestroyManyApiDoc } from 'src/features/fill/controllers/fillDestroyManyController';
import { fillFindApiDoc } from 'src/features/fill/controllers/fillFindController';
import { fillFindManyApiDoc } from 'src/features/fill/controllers/fillFindManyController';
import { fillImportApiDoc } from 'src/features/fill/controllers/fillImporterController';
import { fillUpdateApiDoc } from 'src/features/fill/controllers/fillUpdateController';
import { fillArchiveManyApiDoc } from 'src/features/fill/controllers/fillArchiveManyController';
import { fillRestoreManyApiDoc } from 'src/features/fill/controllers/fillRestoreManyController';

export function fillApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    fillAutocompleteApiDoc,
    fillCreateApiDoc,
    fillArchiveManyApiDoc,
    fillRestoreManyApiDoc,
    fillDestroyManyApiDoc,
    fillFindApiDoc,
    fillFindManyApiDoc,
    fillUpdateApiDoc,
    fillImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Fill'],
      security,
    });
  });
}
