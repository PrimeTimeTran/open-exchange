import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { instrumentAutocompleteApiDoc } from 'src/features/instrument/controllers/instrumentAutocompleteController';
import { instrumentCreateApiDoc } from 'src/features/instrument/controllers/instrumentCreateController';
import { instrumentDestroyManyApiDoc } from 'src/features/instrument/controllers/instrumentDestroyManyController';
import { instrumentFindApiDoc } from 'src/features/instrument/controllers/instrumentFindController';
import { instrumentFindManyApiDoc } from 'src/features/instrument/controllers/instrumentFindManyController';
import { instrumentImportApiDoc } from 'src/features/instrument/controllers/instrumentImporterController';
import { instrumentUpdateApiDoc } from 'src/features/instrument/controllers/instrumentUpdateController';
import { instrumentArchiveManyApiDoc } from 'src/features/instrument/controllers/instrumentArchiveManyController';
import { instrumentRestoreManyApiDoc } from 'src/features/instrument/controllers/instrumentRestoreManyController';

export function instrumentApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    instrumentAutocompleteApiDoc,
    instrumentCreateApiDoc,
    instrumentArchiveManyApiDoc,
    instrumentRestoreManyApiDoc,
    instrumentDestroyManyApiDoc,
    instrumentFindApiDoc,
    instrumentFindManyApiDoc,
    instrumentUpdateApiDoc,
    instrumentImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Instrument'],
      security,
    });
  });
}
