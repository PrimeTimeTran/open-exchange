import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { candidateAutocompleteApiDoc } from 'src/features/candidate/controllers/candidateAutocompleteController';
import { candidateCreateApiDoc } from 'src/features/candidate/controllers/candidateCreateController';
import { candidateDestroyManyApiDoc } from 'src/features/candidate/controllers/candidateDestroyManyController';
import { candidateFindApiDoc } from 'src/features/candidate/controllers/candidateFindController';
import { candidateFindManyApiDoc } from 'src/features/candidate/controllers/candidateFindManyController';
import { candidateImportApiDoc } from 'src/features/candidate/controllers/candidateImporterController';
import { candidateUpdateApiDoc } from 'src/features/candidate/controllers/candidateUpdateController';
import { candidateArchiveManyApiDoc } from 'src/features/candidate/controllers/candidateArchiveManyController';
import { candidateRestoreManyApiDoc } from 'src/features/candidate/controllers/candidateRestoreManyController';

export function candidateApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    candidateAutocompleteApiDoc,
    candidateCreateApiDoc,
    candidateArchiveManyApiDoc,
    candidateRestoreManyApiDoc,
    candidateDestroyManyApiDoc,
    candidateFindApiDoc,
    candidateFindManyApiDoc,
    candidateUpdateApiDoc,
    candidateImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Candidate'],
      security,
    });
  });
}
