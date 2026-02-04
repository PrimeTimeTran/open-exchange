import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { feedbackAutocompleteApiDoc } from 'src/features/feedback/controllers/feedbackAutocompleteController';
import { feedbackCreateApiDoc } from 'src/features/feedback/controllers/feedbackCreateController';
import { feedbackDestroyManyApiDoc } from 'src/features/feedback/controllers/feedbackDestroyManyController';
import { feedbackFindApiDoc } from 'src/features/feedback/controllers/feedbackFindController';
import { feedbackFindManyApiDoc } from 'src/features/feedback/controllers/feedbackFindManyController';
import { feedbackImportApiDoc } from 'src/features/feedback/controllers/feedbackImporterController';
import { feedbackUpdateApiDoc } from 'src/features/feedback/controllers/feedbackUpdateController';
import { feedbackArchiveManyApiDoc } from 'src/features/feedback/controllers/feedbackArchiveManyController';
import { feedbackRestoreManyApiDoc } from 'src/features/feedback/controllers/feedbackRestoreManyController';

export function feedbackApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    feedbackAutocompleteApiDoc,
    feedbackCreateApiDoc,
    feedbackArchiveManyApiDoc,
    feedbackRestoreManyApiDoc,
    feedbackDestroyManyApiDoc,
    feedbackFindApiDoc,
    feedbackFindManyApiDoc,
    feedbackUpdateApiDoc,
    feedbackImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Feedback'],
      security,
    });
  });
}
