'use client';

import { instrumentImportApiCall } from 'src/features/instrument/instrumentApiCalls';
import {
  instrumentImportFileSchema,
  instrumentImportInputSchema,
} from 'src/features/instrument/instrumentSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function InstrumentImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'type',
        'meta',
        'status',
        'underlyingAsset',
        'quoteAsset',
      ]}
      labels={context.dictionary.instrument.fields}
      context={context}
      validationSchema={instrumentImportInputSchema}
      fileSchema={instrumentImportFileSchema}
      importerFn={instrumentImportApiCall}
      breadcrumbRoot={[context.dictionary.instrument.list.menu, '/instrument']}
      queryKeyToInvalidate={['instrument']}
    />
  );
}
