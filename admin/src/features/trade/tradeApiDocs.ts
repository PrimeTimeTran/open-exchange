import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { tradeAutocompleteApiDoc } from 'src/features/trade/controllers/tradeAutocompleteController';
import { tradeCreateApiDoc } from 'src/features/trade/controllers/tradeCreateController';
import { tradeDestroyManyApiDoc } from 'src/features/trade/controllers/tradeDestroyManyController';
import { tradeFindApiDoc } from 'src/features/trade/controllers/tradeFindController';
import { tradeFindManyApiDoc } from 'src/features/trade/controllers/tradeFindManyController';
import { tradeImportApiDoc } from 'src/features/trade/controllers/tradeImporterController';
import { tradeUpdateApiDoc } from 'src/features/trade/controllers/tradeUpdateController';
import { tradeArchiveManyApiDoc } from 'src/features/trade/controllers/tradeArchiveManyController';
import { tradeRestoreManyApiDoc } from 'src/features/trade/controllers/tradeRestoreManyController';

export function tradeApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    tradeAutocompleteApiDoc,
    tradeCreateApiDoc,
    tradeArchiveManyApiDoc,
    tradeRestoreManyApiDoc,
    tradeDestroyManyApiDoc,
    tradeFindApiDoc,
    tradeFindManyApiDoc,
    tradeUpdateApiDoc,
    tradeImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Trade'],
      security,
    });
  });
}
