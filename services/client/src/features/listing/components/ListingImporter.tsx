'use client';

import { listingImportApiCall } from 'src/features/listing/listingApiCalls';
import {
  listingImportFileSchema,
  listingImportInputSchema,
} from 'src/features/listing/listingSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function ListingImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'companyName',
        'legalName',
        'jurisdiction',
        'incorporationDate',
        'website',
        'assetSymbol',
        'assetClass',
        'status',
        'submittedAt',
        'decisionAt',
        'kycCompleted',
        'docsSubmitted',
        'riskDisclosureUrl',
        'primaryContactName',
        'primaryContactEmail',
        'reviewedBy',
        'notes',
        'meta',
      ]}
      labels={context.dictionary.listing.fields}
      context={context}
      validationSchema={listingImportInputSchema}
      fileSchema={listingImportFileSchema}
      importerFn={listingImportApiCall}
      breadcrumbRoot={[context.dictionary.listing.list.menu, '/listing']}
      queryKeyToInvalidate={['listing']}
    />
  );
}
