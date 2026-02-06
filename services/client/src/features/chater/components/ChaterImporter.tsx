'use client';

import { chaterImportApiCall } from 'src/features/chater/chaterApiCalls';
import {
  chaterImportFileSchema,
  chaterImportInputSchema,
} from 'src/features/chater/chaterSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function ChaterImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'nickname',
        'status',
        'role',
        'meta',
        'user',
        'chat',
      ]}
      labels={context.dictionary.chater.fields}
      context={context}
      validationSchema={chaterImportInputSchema}
      fileSchema={chaterImportFileSchema}
      importerFn={chaterImportApiCall}
      breadcrumbRoot={[context.dictionary.chater.list.menu, '/chater']}
      queryKeyToInvalidate={['chater']}
    />
  );
}
