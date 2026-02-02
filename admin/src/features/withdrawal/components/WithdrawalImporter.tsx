'use client';

import { withdrawalImportApiCall } from 'src/features/withdrawal/withdrawalApiCalls';
import {
  withdrawalImportFileSchema,
  withdrawalImportInputSchema,
} from 'src/features/withdrawal/withdrawalSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function WithdrawalImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'amount',
        'fee',
        'status',
        'destinationAddress',
        'destinationTag',
        'chain',
        'txHash',
        'failureReason',
        'requestedBy',
        'approvedBy',
        'approvedAt',
        'requestedAt',
        'broadcastAt',
        'confirmedAt',
        'confirmations',
        'meta',
        'account',
        'asset',
      ]}
      labels={context.dictionary.withdrawal.fields}
      context={context}
      validationSchema={withdrawalImportInputSchema}
      fileSchema={withdrawalImportFileSchema}
      importerFn={withdrawalImportApiCall}
      breadcrumbRoot={[context.dictionary.withdrawal.list.menu, '/withdrawal']}
      queryKeyToInvalidate={['withdrawal']}
    />
  );
}
