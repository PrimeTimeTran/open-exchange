'use client';

import { chatImportApiCall } from 'src/features/chat/chatApiCalls';
import {
  chatImportFileSchema,
  chatImportInputSchema,
} from 'src/features/chat/chatSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function ChatImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'name',
        'media',
        'meta',
        'active',
      ]}
      labels={context.dictionary.chat.fields}
      context={context}
      validationSchema={chatImportInputSchema}
      fileSchema={chatImportFileSchema}
      importerFn={chatImportApiCall}
      breadcrumbRoot={[context.dictionary.chat.list.menu, '/chat']}
      queryKeyToInvalidate={['chat']}
    />
  );
}
