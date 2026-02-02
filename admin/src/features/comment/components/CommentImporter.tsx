'use client';

import { commentImportApiCall } from 'src/features/comment/commentApiCalls';
import {
  commentImportFileSchema,
  commentImportInputSchema,
} from 'src/features/comment/commentSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function CommentImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'body',
        'meta',
        'type',
        'images',
        'user',
      ]}
      labels={context.dictionary.comment.fields}
      context={context}
      validationSchema={commentImportInputSchema}
      fileSchema={commentImportFileSchema}
      importerFn={commentImportApiCall}
      breadcrumbRoot={[context.dictionary.comment.list.menu, '/comment']}
      queryKeyToInvalidate={['comment']}
    />
  );
}
