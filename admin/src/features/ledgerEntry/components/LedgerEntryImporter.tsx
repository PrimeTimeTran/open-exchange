'use client';

import { ledgerEntryImportApiCall } from 'src/features/ledgerEntry/ledgerEntryApiCalls';
import {
  ledgerEntryImportFileSchema,
  ledgerEntryImportInputSchema,
} from 'src/features/ledgerEntry/ledgerEntrySchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function LedgerEntryImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'amount',
        'accountId',
        'meta',
        'event',
      ]}
      labels={context.dictionary.ledgerEntry.fields}
      context={context}
      validationSchema={ledgerEntryImportInputSchema}
      fileSchema={ledgerEntryImportFileSchema}
      importerFn={ledgerEntryImportApiCall}
      breadcrumbRoot={[context.dictionary.ledgerEntry.list.menu, '/ledger-entry']}
      queryKeyToInvalidate={['ledgerEntry']}
    />
  );
}
