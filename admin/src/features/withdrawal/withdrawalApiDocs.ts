import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { withdrawalAutocompleteApiDoc } from 'src/features/withdrawal/controllers/withdrawalAutocompleteController';
import { withdrawalCreateApiDoc } from 'src/features/withdrawal/controllers/withdrawalCreateController';
import { withdrawalDestroyManyApiDoc } from 'src/features/withdrawal/controllers/withdrawalDestroyManyController';
import { withdrawalFindApiDoc } from 'src/features/withdrawal/controllers/withdrawalFindController';
import { withdrawalFindManyApiDoc } from 'src/features/withdrawal/controllers/withdrawalFindManyController';
import { withdrawalImportApiDoc } from 'src/features/withdrawal/controllers/withdrawalImporterController';
import { withdrawalUpdateApiDoc } from 'src/features/withdrawal/controllers/withdrawalUpdateController';
import { withdrawalArchiveManyApiDoc } from 'src/features/withdrawal/controllers/withdrawalArchiveManyController';
import { withdrawalRestoreManyApiDoc } from 'src/features/withdrawal/controllers/withdrawalRestoreManyController';

export function withdrawalApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    withdrawalAutocompleteApiDoc,
    withdrawalCreateApiDoc,
    withdrawalArchiveManyApiDoc,
    withdrawalRestoreManyApiDoc,
    withdrawalDestroyManyApiDoc,
    withdrawalFindApiDoc,
    withdrawalFindManyApiDoc,
    withdrawalUpdateApiDoc,
    withdrawalImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Withdrawal'],
      security,
    });
  });
}
