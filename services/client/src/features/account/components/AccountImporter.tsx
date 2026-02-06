'use client';

import { accountImportApiCall } from 'src/features/account/accountApiCalls';
import {
  accountImportFileSchema,
  accountImportInputSchema,
} from 'src/features/account/accountSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function AccountImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'type',
        'status',
        'user',
        'meta',
      ]}
      labels={context.dictionary.account.fields}
      context={context}
      validationSchema={accountImportInputSchema}
      fileSchema={accountImportFileSchema}
      importerFn={accountImportApiCall}
      breadcrumbRoot={[context.dictionary.account.list.menu, '/account']}
      queryKeyToInvalidate={['account']}
    />
  );
}
