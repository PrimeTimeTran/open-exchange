'use client';

import { feeScheduleImportApiCall } from 'src/features/feeSchedule/feeScheduleApiCalls';
import {
  feeScheduleImportFileSchema,
  feeScheduleImportInputSchema,
} from 'src/features/feeSchedule/feeScheduleSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function FeeScheduleImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'scope',
        'makerFeeBps',
        'takerFeeBps',
        'minFeeAmount',
        'effectiveFrom',
        'effectiveTo',
        'tier',
        'accountId',
        'instrumentId',
        'meta',
      ]}
      labels={context.dictionary.feeSchedule.fields}
      context={context}
      validationSchema={feeScheduleImportInputSchema}
      fileSchema={feeScheduleImportFileSchema}
      importerFn={feeScheduleImportApiCall}
      breadcrumbRoot={[context.dictionary.feeSchedule.list.menu, '/fee-schedule']}
      queryKeyToInvalidate={['feeSchedule']}
    />
  );
}
