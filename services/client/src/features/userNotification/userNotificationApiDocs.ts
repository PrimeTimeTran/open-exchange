import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { userNotificationAutocompleteApiDoc } from 'src/features/userNotification/controllers/userNotificationAutocompleteController';
import { userNotificationCreateApiDoc } from 'src/features/userNotification/controllers/userNotificationCreateController';
import { userNotificationDestroyManyApiDoc } from 'src/features/userNotification/controllers/userNotificationDestroyManyController';
import { userNotificationFindApiDoc } from 'src/features/userNotification/controllers/userNotificationFindController';
import { userNotificationFindManyApiDoc } from 'src/features/userNotification/controllers/userNotificationFindManyController';
import { userNotificationImportApiDoc } from 'src/features/userNotification/controllers/userNotificationImporterController';
import { userNotificationUpdateApiDoc } from 'src/features/userNotification/controllers/userNotificationUpdateController';
import { userNotificationArchiveManyApiDoc } from 'src/features/userNotification/controllers/userNotificationArchiveManyController';
import { userNotificationRestoreManyApiDoc } from 'src/features/userNotification/controllers/userNotificationRestoreManyController';

export function userNotificationApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    userNotificationAutocompleteApiDoc,
    userNotificationCreateApiDoc,
    userNotificationArchiveManyApiDoc,
    userNotificationRestoreManyApiDoc,
    userNotificationDestroyManyApiDoc,
    userNotificationFindApiDoc,
    userNotificationFindManyApiDoc,
    userNotificationUpdateApiDoc,
    userNotificationImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['UserNotification'],
      security,
    });
  });
}
