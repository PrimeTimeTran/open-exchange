import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { referralAutocompleteApiDoc } from 'src/features/referral/controllers/referralAutocompleteController';
import { referralCreateApiDoc } from 'src/features/referral/controllers/referralCreateController';
import { referralDestroyManyApiDoc } from 'src/features/referral/controllers/referralDestroyManyController';
import { referralFindApiDoc } from 'src/features/referral/controllers/referralFindController';
import { referralFindManyApiDoc } from 'src/features/referral/controllers/referralFindManyController';
import { referralImportApiDoc } from 'src/features/referral/controllers/referralImporterController';
import { referralUpdateApiDoc } from 'src/features/referral/controllers/referralUpdateController';
import { referralArchiveManyApiDoc } from 'src/features/referral/controllers/referralArchiveManyController';
import { referralRestoreManyApiDoc } from 'src/features/referral/controllers/referralRestoreManyController';

export function referralApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    referralAutocompleteApiDoc,
    referralCreateApiDoc,
    referralArchiveManyApiDoc,
    referralRestoreManyApiDoc,
    referralDestroyManyApiDoc,
    referralFindApiDoc,
    referralFindManyApiDoc,
    referralUpdateApiDoc,
    referralImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Referral'],
      security,
    });
  });
}
