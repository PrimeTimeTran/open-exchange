import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { accountAutocompleteApiDoc } from 'src/features/account/controllers/accountAutocompleteController';
import { accountCreateApiDoc } from 'src/features/account/controllers/accountCreateController';
import { accountDestroyManyApiDoc } from 'src/features/account/controllers/accountDestroyManyController';
import { accountFindApiDoc } from 'src/features/account/controllers/accountFindController';
import { accountFindManyApiDoc } from 'src/features/account/controllers/accountFindManyController';
import { accountImportApiDoc } from 'src/features/account/controllers/accountImporterController';
import { accountUpdateApiDoc } from 'src/features/account/controllers/accountUpdateController';
import { accountArchiveManyApiDoc } from 'src/features/account/controllers/accountArchiveManyController';
import { accountRestoreManyApiDoc } from 'src/features/account/controllers/accountRestoreManyController';

export function accountApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    accountAutocompleteApiDoc,
    accountCreateApiDoc,
    accountArchiveManyApiDoc,
    accountRestoreManyApiDoc,
    accountDestroyManyApiDoc,
    accountFindApiDoc,
    accountFindManyApiDoc,
    accountUpdateApiDoc,
    accountImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Account'],
      security,
    });
  });
}
