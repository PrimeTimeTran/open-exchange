import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { feeScheduleAutocompleteApiDoc } from 'src/features/feeSchedule/controllers/feeScheduleAutocompleteController';
import { feeScheduleCreateApiDoc } from 'src/features/feeSchedule/controllers/feeScheduleCreateController';
import { feeScheduleDestroyManyApiDoc } from 'src/features/feeSchedule/controllers/feeScheduleDestroyManyController';
import { feeScheduleFindApiDoc } from 'src/features/feeSchedule/controllers/feeScheduleFindController';
import { feeScheduleFindManyApiDoc } from 'src/features/feeSchedule/controllers/feeScheduleFindManyController';
import { feeScheduleImportApiDoc } from 'src/features/feeSchedule/controllers/feeScheduleImporterController';
import { feeScheduleUpdateApiDoc } from 'src/features/feeSchedule/controllers/feeScheduleUpdateController';
import { feeScheduleArchiveManyApiDoc } from 'src/features/feeSchedule/controllers/feeScheduleArchiveManyController';
import { feeScheduleRestoreManyApiDoc } from 'src/features/feeSchedule/controllers/feeScheduleRestoreManyController';

export function feeScheduleApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    feeScheduleAutocompleteApiDoc,
    feeScheduleCreateApiDoc,
    feeScheduleArchiveManyApiDoc,
    feeScheduleRestoreManyApiDoc,
    feeScheduleDestroyManyApiDoc,
    feeScheduleFindApiDoc,
    feeScheduleFindManyApiDoc,
    feeScheduleUpdateApiDoc,
    feeScheduleImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['FeeSchedule'],
      security,
    });
  });
}
