'use client';

import { referralImportApiCall } from 'src/features/referral/referralApiCalls';
import {
  referralImportFileSchema,
  referralImportInputSchema,
} from 'src/features/referral/referralSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function ReferralImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'referrerUserId',
        'referredUserId',
        'referralCode',
        'source',
        'status',
        'rewardType',
        'rewardAmount',
        'rewardCurrency',
        'rewardedAt',
        'meta',
      ]}
      labels={context.dictionary.referral.fields}
      context={context}
      validationSchema={referralImportInputSchema}
      fileSchema={referralImportFileSchema}
      importerFn={referralImportApiCall}
      breadcrumbRoot={[context.dictionary.referral.list.menu, '/referral']}
      queryKeyToInvalidate={['referral']}
    />
  );
}
