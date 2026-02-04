import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { ledgerEventAutocompleteApiDoc } from 'src/features/ledgerEvent/controllers/ledgerEventAutocompleteController';
import { ledgerEventCreateApiDoc } from 'src/features/ledgerEvent/controllers/ledgerEventCreateController';
import { ledgerEventDestroyManyApiDoc } from 'src/features/ledgerEvent/controllers/ledgerEventDestroyManyController';
import { ledgerEventFindApiDoc } from 'src/features/ledgerEvent/controllers/ledgerEventFindController';
import { ledgerEventFindManyApiDoc } from 'src/features/ledgerEvent/controllers/ledgerEventFindManyController';
import { ledgerEventImportApiDoc } from 'src/features/ledgerEvent/controllers/ledgerEventImporterController';
import { ledgerEventUpdateApiDoc } from 'src/features/ledgerEvent/controllers/ledgerEventUpdateController';
import { ledgerEventArchiveManyApiDoc } from 'src/features/ledgerEvent/controllers/ledgerEventArchiveManyController';
import { ledgerEventRestoreManyApiDoc } from 'src/features/ledgerEvent/controllers/ledgerEventRestoreManyController';

export function ledgerEventApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    ledgerEventAutocompleteApiDoc,
    ledgerEventCreateApiDoc,
    ledgerEventArchiveManyApiDoc,
    ledgerEventRestoreManyApiDoc,
    ledgerEventDestroyManyApiDoc,
    ledgerEventFindApiDoc,
    ledgerEventFindManyApiDoc,
    ledgerEventUpdateApiDoc,
    ledgerEventImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['LedgerEvent'],
      security,
    });
  });
}
