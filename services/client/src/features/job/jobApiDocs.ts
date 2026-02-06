import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { jobAutocompleteApiDoc } from 'src/features/job/controllers/jobAutocompleteController';
import { jobCreateApiDoc } from 'src/features/job/controllers/jobCreateController';
import { jobDestroyManyApiDoc } from 'src/features/job/controllers/jobDestroyManyController';
import { jobFindApiDoc } from 'src/features/job/controllers/jobFindController';
import { jobFindManyApiDoc } from 'src/features/job/controllers/jobFindManyController';
import { jobImportApiDoc } from 'src/features/job/controllers/jobImporterController';
import { jobUpdateApiDoc } from 'src/features/job/controllers/jobUpdateController';
import { jobArchiveManyApiDoc } from 'src/features/job/controllers/jobArchiveManyController';
import { jobRestoreManyApiDoc } from 'src/features/job/controllers/jobRestoreManyController';

export function jobApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    jobAutocompleteApiDoc,
    jobCreateApiDoc,
    jobArchiveManyApiDoc,
    jobRestoreManyApiDoc,
    jobDestroyManyApiDoc,
    jobFindApiDoc,
    jobFindManyApiDoc,
    jobUpdateApiDoc,
    jobImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Job'],
      security,
    });
  });
}
