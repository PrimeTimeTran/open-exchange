'use client';

import { depositImportApiCall } from 'src/features/deposit/depositApiCalls';
import {
  depositImportFileSchema,
  depositImportInputSchema,
} from 'src/features/deposit/depositSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function DepositImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'amount',
        'status',
        'chain',
        'txHash',
        'fromAddress',
        'confirmations',
        'requiredConfirmations',
        'detectedAt',
        'confirmedAt',
        'creditedAt',
        'meta',
        'account',
        'asset',
      ]}
      labels={context.dictionary.deposit.fields}
      context={context}
      validationSchema={depositImportInputSchema}
      fileSchema={depositImportFileSchema}
      importerFn={depositImportApiCall}
      breadcrumbRoot={[context.dictionary.deposit.list.menu, '/deposit']}
      queryKeyToInvalidate={['deposit']}
    />
  );
}
