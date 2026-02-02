'use client';

import { chateeImportApiCall } from 'src/features/chatee/chateeApiCalls';
import {
  chateeImportFileSchema,
  chateeImportInputSchema,
} from 'src/features/chatee/chateeSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function ChateeImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'nickname',
        'status',
        'role',
        'user',
        'chat',
      ]}
      labels={context.dictionary.chatee.fields}
      context={context}
      validationSchema={chateeImportInputSchema}
      fileSchema={chateeImportFileSchema}
      importerFn={chateeImportApiCall}
      breadcrumbRoot={[context.dictionary.chatee.list.menu, '/chatee']}
      queryKeyToInvalidate={['chatee']}
    />
  );
}
