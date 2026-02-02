'use client';

import { tradeFillImportApiCall } from 'src/features/tradeFill/tradeFillApiCalls';
import {
  tradeFillImportFileSchema,
  tradeFillImportInputSchema,
} from 'src/features/tradeFill/tradeFillSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function TradeFillImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'side',
        'price',
        'quantity',
        'fee',
        'trade',
      ]}
      labels={context.dictionary.tradeFill.fields}
      context={context}
      validationSchema={tradeFillImportInputSchema}
      fileSchema={tradeFillImportFileSchema}
      importerFn={tradeFillImportApiCall}
      breadcrumbRoot={[context.dictionary.tradeFill.list.menu, '/trade-fill']}
      queryKeyToInvalidate={['tradeFill']}
    />
  );
}
