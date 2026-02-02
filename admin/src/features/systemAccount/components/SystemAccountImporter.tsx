'use client';

import { systemAccountImportApiCall } from 'src/features/systemAccount/systemAccountApiCalls';
import {
  systemAccountImportFileSchema,
  systemAccountImportInputSchema,
} from 'src/features/systemAccount/systemAccountSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function SystemAccountImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'type',
        'name',
        'description',
        'isActive',
        'meta',
      ]}
      labels={context.dictionary.systemAccount.fields}
      context={context}
      validationSchema={systemAccountImportInputSchema}
      fileSchema={systemAccountImportFileSchema}
      importerFn={systemAccountImportApiCall}
      breadcrumbRoot={[context.dictionary.systemAccount.list.menu, '/system-account']}
      queryKeyToInvalidate={['systemAccount']}
    />
  );
}
