'use client';

import { orderImportApiCall } from 'src/features/order/orderApiCalls';
import {
  orderImportFileSchema,
  orderImportInputSchema,
} from 'src/features/order/orderSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function OrderImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'user',
        'account',
        'instrument',
        'side',
        'type',
        'price',
        'quantity',
        'quantityFilled',
        'status',
        'timeInFore',
        'meta',
      ]}
      labels={context.dictionary.order.fields}
      context={context}
      validationSchema={orderImportInputSchema}
      fileSchema={orderImportFileSchema}
      importerFn={orderImportApiCall}
      breadcrumbRoot={[context.dictionary.order.list.menu, '/order']}
      queryKeyToInvalidate={['order']}
    />
  );
}
