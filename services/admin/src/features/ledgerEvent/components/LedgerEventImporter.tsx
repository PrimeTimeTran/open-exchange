'use client';

import { ledgerEventImportApiCall } from 'src/features/ledgerEvent/ledgerEventApiCalls';
import {
  ledgerEventImportFileSchema,
  ledgerEventImportInputSchema,
} from 'src/features/ledgerEvent/ledgerEventSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function LedgerEventImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'type',
        'referenceId',
        'referenceType',
        'status',
        'description',
        'meta',
      ]}
      labels={context.dictionary.ledgerEvent.fields}
      context={context}
      validationSchema={ledgerEventImportInputSchema}
      fileSchema={ledgerEventImportFileSchema}
      importerFn={ledgerEventImportApiCall}
      breadcrumbRoot={[context.dictionary.ledgerEvent.list.menu, '/ledger-event']}
      queryKeyToInvalidate={['ledgerEvent']}
    />
  );
}
