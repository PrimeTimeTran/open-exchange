'use client';

import { postImportApiCall } from 'src/features/post/postApiCalls';
import {
  postImportFileSchema,
  postImportInputSchema,
} from 'src/features/post/postSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function PostImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'title',
        'body',
        'files',
        'images',
        'type',
        'user',
        'meta',
      ]}
      labels={context.dictionary.post.fields}
      context={context}
      validationSchema={postImportInputSchema}
      fileSchema={postImportFileSchema}
      importerFn={postImportApiCall}
      breadcrumbRoot={[context.dictionary.post.list.menu, '/post']}
      queryKeyToInvalidate={['post']}
    />
  );
}
