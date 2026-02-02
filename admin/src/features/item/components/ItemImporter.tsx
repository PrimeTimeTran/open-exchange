'use client';

import { itemImportApiCall } from 'src/features/item/itemApiCalls';
import {
  itemImportFileSchema,
  itemImportInputSchema,
} from 'src/features/item/itemSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function ItemImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'name',
        'caption',
        'description',
        'price',
        'photos',
        'category',
        'meta',
        'files',
      ]}
      labels={context.dictionary.item.fields}
      context={context}
      validationSchema={itemImportInputSchema}
      fileSchema={itemImportFileSchema}
      importerFn={itemImportApiCall}
      breadcrumbRoot={[context.dictionary.item.list.menu, '/item']}
      queryKeyToInvalidate={['item']}
    />
  );
}
