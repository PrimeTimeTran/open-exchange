import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { ledgerEntryAutocompleteApiDoc } from 'src/features/ledgerEntry/controllers/ledgerEntryAutocompleteController';
import { ledgerEntryCreateApiDoc } from 'src/features/ledgerEntry/controllers/ledgerEntryCreateController';
import { ledgerEntryDestroyManyApiDoc } from 'src/features/ledgerEntry/controllers/ledgerEntryDestroyManyController';
import { ledgerEntryFindApiDoc } from 'src/features/ledgerEntry/controllers/ledgerEntryFindController';
import { ledgerEntryFindManyApiDoc } from 'src/features/ledgerEntry/controllers/ledgerEntryFindManyController';
import { ledgerEntryImportApiDoc } from 'src/features/ledgerEntry/controllers/ledgerEntryImporterController';
import { ledgerEntryUpdateApiDoc } from 'src/features/ledgerEntry/controllers/ledgerEntryUpdateController';
import { ledgerEntryArchiveManyApiDoc } from 'src/features/ledgerEntry/controllers/ledgerEntryArchiveManyController';
import { ledgerEntryRestoreManyApiDoc } from 'src/features/ledgerEntry/controllers/ledgerEntryRestoreManyController';

export function ledgerEntryApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    ledgerEntryAutocompleteApiDoc,
    ledgerEntryCreateApiDoc,
    ledgerEntryArchiveManyApiDoc,
    ledgerEntryRestoreManyApiDoc,
    ledgerEntryDestroyManyApiDoc,
    ledgerEntryFindApiDoc,
    ledgerEntryFindManyApiDoc,
    ledgerEntryUpdateApiDoc,
    ledgerEntryImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['LedgerEntry'],
      security,
    });
  });
}
