'use client';

import { userNotificationImportApiCall } from 'src/features/userNotification/userNotificationApiCalls';
import {
  userNotificationImportFileSchema,
  userNotificationImportInputSchema,
} from 'src/features/userNotification/userNotificationSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function UserNotificationImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'readAt',
        'dismissedAt',
        'acknowledgedAt',
        'deliveryChannel',
        'deliveredAt',
        'meta',
        'notification',
        'user',
      ]}
      labels={context.dictionary.userNotification.fields}
      context={context}
      validationSchema={userNotificationImportInputSchema}
      fileSchema={userNotificationImportFileSchema}
      importerFn={userNotificationImportApiCall}
      breadcrumbRoot={[context.dictionary.userNotification.list.menu, '/user-notification']}
      queryKeyToInvalidate={['userNotification']}
    />
  );
}
