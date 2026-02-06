'use client';

import { marketMakerImportApiCall } from 'src/features/marketMaker/marketMakerApiCalls';
import {
  marketMakerImportFileSchema,
  marketMakerImportInputSchema,
} from 'src/features/marketMaker/marketMakerSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function MarketMakerImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'organizationName',
        'contactEmail',
        'contactPhone',
        'status',
        'tier',
        'marketsSupported',
        'minQuoteSize',
        'maxQuoteSize',
        'spreadLimit',
        'quoteObligation',
        'dailyVolumeTarget',
        'makerFee',
        'takerFee',
        'rebateRate',
        'rebateBalance',
        'apiAccess',
        'maxOrdersPerSecond',
        'directMarketAccess',
        'contractSignedAt',
        'obligationViolationCount',
        'auditLog',
        'notesInternal',
        'specialOrderTypes',
      ]}
      labels={context.dictionary.marketMaker.fields}
      context={context}
      validationSchema={marketMakerImportInputSchema}
      fileSchema={marketMakerImportFileSchema}
      importerFn={marketMakerImportApiCall}
      breadcrumbRoot={[context.dictionary.marketMaker.list.menu, '/market-maker']}
      queryKeyToInvalidate={['marketMaker']}
    />
  );
}
