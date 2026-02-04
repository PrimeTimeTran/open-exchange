'use client';

import { feedbackImportApiCall } from 'src/features/feedback/feedbackApiCalls';
import {
  feedbackImportFileSchema,
  feedbackImportInputSchema,
} from 'src/features/feedback/feedbackSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function FeedbackImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'title',
        'description',
        'attachments',
        'type',
        'status',
        'user',
        'json',
      ]}
      labels={context.dictionary.feedback.fields}
      context={context}
      validationSchema={feedbackImportInputSchema}
      fileSchema={feedbackImportFileSchema}
      importerFn={feedbackImportApiCall}
      breadcrumbRoot={[context.dictionary.feedback.list.menu, '/feedback']}
      queryKeyToInvalidate={['feedback']}
    />
  );
}
