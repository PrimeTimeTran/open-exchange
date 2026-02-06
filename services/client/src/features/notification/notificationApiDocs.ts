import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { notificationAutocompleteApiDoc } from 'src/features/notification/controllers/notificationAutocompleteController';
import { notificationCreateApiDoc } from 'src/features/notification/controllers/notificationCreateController';
import { notificationDestroyManyApiDoc } from 'src/features/notification/controllers/notificationDestroyManyController';
import { notificationFindApiDoc } from 'src/features/notification/controllers/notificationFindController';
import { notificationFindManyApiDoc } from 'src/features/notification/controllers/notificationFindManyController';
import { notificationImportApiDoc } from 'src/features/notification/controllers/notificationImporterController';
import { notificationUpdateApiDoc } from 'src/features/notification/controllers/notificationUpdateController';
import { notificationArchiveManyApiDoc } from 'src/features/notification/controllers/notificationArchiveManyController';
import { notificationRestoreManyApiDoc } from 'src/features/notification/controllers/notificationRestoreManyController';

export function notificationApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    notificationAutocompleteApiDoc,
    notificationCreateApiDoc,
    notificationArchiveManyApiDoc,
    notificationRestoreManyApiDoc,
    notificationDestroyManyApiDoc,
    notificationFindApiDoc,
    notificationFindManyApiDoc,
    notificationUpdateApiDoc,
    notificationImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Notification'],
      security,
    });
  });
}
