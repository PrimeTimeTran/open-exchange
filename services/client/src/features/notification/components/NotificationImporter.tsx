'use client';

import { notificationImportApiCall } from 'src/features/notification/notificationApiCalls';
import {
  notificationImportFileSchema,
  notificationImportInputSchema,
} from 'src/features/notification/notificationSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function NotificationImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'type',
        'severity',
        'title',
        'body',
        'actionUrl',
        'scope',
        'targetUserId',
        'targetSegment',
        'persistent',
        'dismissible',
        'requiresAck',
        'meta',
      ]}
      labels={context.dictionary.notification.fields}
      context={context}
      validationSchema={notificationImportInputSchema}
      fileSchema={notificationImportFileSchema}
      importerFn={notificationImportApiCall}
      breadcrumbRoot={[context.dictionary.notification.list.menu, '/notification']}
      queryKeyToInvalidate={['notification']}
    />
  );
}
