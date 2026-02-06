'use client';

import { candidateImportApiCall } from 'src/features/candidate/candidateApiCalls';
import {
  candidateImportFileSchema,
  candidateImportInputSchema,
} from 'src/features/candidate/candidateSchemas';
import { Importer } from 'src/shared/components/importer/Importer';
import { AppContext } from 'src/shared/controller/appContext';

export function CandidateImporter({ context }: { context: AppContext }) {
  return (
    <Importer
      keys={[
        'firstName',
        'lastName',
        'preferredName',
        'email',
        'phone',
        'country',
        'timezone',
        'linkedinUrl',
        'githubUrl',
        'portfolioUrl',
        'resumeUrl',
        'resume',
        'meta',
      ]}
      labels={context.dictionary.candidate.fields}
      context={context}
      validationSchema={candidateImportInputSchema}
      fileSchema={candidateImportFileSchema}
      importerFn={candidateImportApiCall}
      breadcrumbRoot={[context.dictionary.candidate.list.menu, '/candidate']}
      queryKeyToInvalidate={['candidate']}
    />
  );
}
