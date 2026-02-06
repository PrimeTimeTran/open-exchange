'use client';

import { messageImportApiCall } from 'src/features/message/messageApiCalls';
import {
  messageImportFileSchema,
  messageImportInputSchema,
} from 'src/features/message/messageSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function MessageImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'body',
        'attachment',
        'images',
        'type',
        'chat',
        'chater',
        'sender',
        'meta',
      ]}
      labels={context.dictionary.message.fields}
      context={context}
      validationSchema={messageImportInputSchema}
      fileSchema={messageImportFileSchema}
      importerFn={messageImportApiCall}
      breadcrumbRoot={[context.dictionary.message.list.menu, '/message']}
      queryKeyToInvalidate={['message']}
    />
  );
}
