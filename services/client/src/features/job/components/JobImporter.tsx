'use client';

import { jobImportApiCall } from 'src/features/job/jobApiCalls';
import {
  jobImportFileSchema,
  jobImportInputSchema,
} from 'src/features/job/jobSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function JobImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'title',
        'team',
        'location',
        'type',
        'remote',
        'description',
        'requirements',
        'responsibilities',
        'quantity',
        'salaryLow',
        'salaryHigh',
        'status',
        'seniority',
        'currency',
        'meta',
      ]}
      labels={context.dictionary.job.fields}
      context={context}
      validationSchema={jobImportInputSchema}
      fileSchema={jobImportFileSchema}
      importerFn={jobImportApiCall}
      breadcrumbRoot={[context.dictionary.job.list.menu, '/job']}
      queryKeyToInvalidate={['job']}
    />
  );
}
