import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { systemAccountAutocompleteApiDoc } from 'src/features/systemAccount/controllers/systemAccountAutocompleteController';
import { systemAccountCreateApiDoc } from 'src/features/systemAccount/controllers/systemAccountCreateController';
import { systemAccountDestroyManyApiDoc } from 'src/features/systemAccount/controllers/systemAccountDestroyManyController';
import { systemAccountFindApiDoc } from 'src/features/systemAccount/controllers/systemAccountFindController';
import { systemAccountFindManyApiDoc } from 'src/features/systemAccount/controllers/systemAccountFindManyController';
import { systemAccountImportApiDoc } from 'src/features/systemAccount/controllers/systemAccountImporterController';
import { systemAccountUpdateApiDoc } from 'src/features/systemAccount/controllers/systemAccountUpdateController';
import { systemAccountArchiveManyApiDoc } from 'src/features/systemAccount/controllers/systemAccountArchiveManyController';
import { systemAccountRestoreManyApiDoc } from 'src/features/systemAccount/controllers/systemAccountRestoreManyController';

export function systemAccountApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    systemAccountAutocompleteApiDoc,
    systemAccountCreateApiDoc,
    systemAccountArchiveManyApiDoc,
    systemAccountRestoreManyApiDoc,
    systemAccountDestroyManyApiDoc,
    systemAccountFindApiDoc,
    systemAccountFindManyApiDoc,
    systemAccountUpdateApiDoc,
    systemAccountImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['SystemAccount'],
      security,
    });
  });
}
