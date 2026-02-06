'use client';

import { fillImportApiCall } from 'src/features/fill/fillApiCalls';
import {
  fillImportFileSchema,
  fillImportInputSchema,
} from 'src/features/fill/fillSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function FillImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'side',
        'price',
        'quantity',
        'fee',
        'trade',
        'meta',
      ]}
      labels={context.dictionary.fill.fields}
      context={context}
      validationSchema={fillImportInputSchema}
      fileSchema={fillImportFileSchema}
      importerFn={fillImportApiCall}
      breadcrumbRoot={[context.dictionary.fill.list.menu, '/fill']}
      queryKeyToInvalidate={['fill']}
    />
  );
}
