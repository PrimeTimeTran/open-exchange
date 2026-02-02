'use client';

import { tradeImportApiCall } from 'src/features/trade/tradeApiCalls';
import {
  tradeImportFileSchema,
  tradeImportInputSchema,
} from 'src/features/trade/tradeSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function TradeImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'price',
        'quantity',
        'buyOrderId',
        'sellOrderId',
        'instrument',
      ]}
      labels={context.dictionary.trade.fields}
      context={context}
      validationSchema={tradeImportInputSchema}
      fileSchema={tradeImportFileSchema}
      importerFn={tradeImportApiCall}
      breadcrumbRoot={[context.dictionary.trade.list.menu, '/trade']}
      queryKeyToInvalidate={['trade']}
    />
  );
}
