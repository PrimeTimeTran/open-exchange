'use client';

import { walletImportApiCall } from 'src/features/wallet/walletApiCalls';
import {
  walletImportFileSchema,
  walletImportInputSchema,
} from 'src/features/wallet/walletSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function WalletImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'available',
        'locked',
        'total',
        'version',
        'meta',
        'user',
        'asset',
        'account',
      ]}
      labels={context.dictionary.wallet.fields}
      context={context}
      validationSchema={walletImportInputSchema}
      fileSchema={walletImportFileSchema}
      importerFn={walletImportApiCall}
      breadcrumbRoot={[context.dictionary.wallet.list.menu, '/wallet']}
      queryKeyToInvalidate={['wallet']}
    />
  );
}
