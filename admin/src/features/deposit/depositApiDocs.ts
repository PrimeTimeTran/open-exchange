import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { depositAutocompleteApiDoc } from 'src/features/deposit/controllers/depositAutocompleteController';
import { depositCreateApiDoc } from 'src/features/deposit/controllers/depositCreateController';
import { depositDestroyManyApiDoc } from 'src/features/deposit/controllers/depositDestroyManyController';
import { depositFindApiDoc } from 'src/features/deposit/controllers/depositFindController';
import { depositFindManyApiDoc } from 'src/features/deposit/controllers/depositFindManyController';
import { depositImportApiDoc } from 'src/features/deposit/controllers/depositImporterController';
import { depositUpdateApiDoc } from 'src/features/deposit/controllers/depositUpdateController';
import { depositArchiveManyApiDoc } from 'src/features/deposit/controllers/depositArchiveManyController';
import { depositRestoreManyApiDoc } from 'src/features/deposit/controllers/depositRestoreManyController';

export function depositApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    depositAutocompleteApiDoc,
    depositCreateApiDoc,
    depositArchiveManyApiDoc,
    depositRestoreManyApiDoc,
    depositDestroyManyApiDoc,
    depositFindApiDoc,
    depositFindManyApiDoc,
    depositUpdateApiDoc,
    depositImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Deposit'],
      security,
    });
  });
}
