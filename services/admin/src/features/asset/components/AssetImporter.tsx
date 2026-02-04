'use client';

import { assetImportApiCall } from 'src/features/asset/assetApiCalls';
import {
  assetImportFileSchema,
  assetImportInputSchema,
} from 'src/features/asset/assetSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function AssetImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'symbol',
        'type',
        'precision',
        'isFractional',
        'decimals',
        'meta',
      ]}
      labels={context.dictionary.asset.fields}
      context={context}
      validationSchema={assetImportInputSchema}
      fileSchema={assetImportFileSchema}
      importerFn={assetImportApiCall}
      breadcrumbRoot={[context.dictionary.asset.list.menu, '/asset']}
      queryKeyToInvalidate={['asset']}
    />
  );
}
