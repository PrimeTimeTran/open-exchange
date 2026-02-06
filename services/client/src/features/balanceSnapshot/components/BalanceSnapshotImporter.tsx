'use client';

import { balanceSnapshotImportApiCall } from 'src/features/balanceSnapshot/balanceSnapshotApiCalls';
import {
  balanceSnapshotImportFileSchema,
  balanceSnapshotImportInputSchema,
} from 'src/features/balanceSnapshot/balanceSnapshotSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function BalanceSnapshotImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'available',
        'locked',
        'total',
        'snapshotAt',
        'account',
        'wallet',
        'asset',
        'meta',
      ]}
      labels={context.dictionary.balanceSnapshot.fields}
      context={context}
      validationSchema={balanceSnapshotImportInputSchema}
      fileSchema={balanceSnapshotImportFileSchema}
      importerFn={balanceSnapshotImportApiCall}
      breadcrumbRoot={[context.dictionary.balanceSnapshot.list.menu, '/balance-snapshot']}
      queryKeyToInvalidate={['balanceSnapshot']}
    />
  );
}
