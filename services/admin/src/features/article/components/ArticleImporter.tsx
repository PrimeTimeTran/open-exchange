'use client';

import { articleImportApiCall } from 'src/features/article/articleApiCalls';
import {
  articleImportFileSchema,
  articleImportInputSchema,
} from 'src/features/article/articleSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function ArticleImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'title',
        'body',
        'meta',
        'type',
        'images',
        'files',
        'user',
      ]}
      labels={context.dictionary.article.fields}
      context={context}
      validationSchema={articleImportInputSchema}
      fileSchema={articleImportFileSchema}
      importerFn={articleImportApiCall}
      breadcrumbRoot={[context.dictionary.article.list.menu, '/article']}
      queryKeyToInvalidate={['article']}
    />
  );
}
