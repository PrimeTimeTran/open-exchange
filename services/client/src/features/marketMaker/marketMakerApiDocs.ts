import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { marketMakerAutocompleteApiDoc } from 'src/features/marketMaker/controllers/marketMakerAutocompleteController';
import { marketMakerCreateApiDoc } from 'src/features/marketMaker/controllers/marketMakerCreateController';
import { marketMakerDestroyManyApiDoc } from 'src/features/marketMaker/controllers/marketMakerDestroyManyController';
import { marketMakerFindApiDoc } from 'src/features/marketMaker/controllers/marketMakerFindController';
import { marketMakerFindManyApiDoc } from 'src/features/marketMaker/controllers/marketMakerFindManyController';
import { marketMakerImportApiDoc } from 'src/features/marketMaker/controllers/marketMakerImporterController';
import { marketMakerUpdateApiDoc } from 'src/features/marketMaker/controllers/marketMakerUpdateController';
import { marketMakerArchiveManyApiDoc } from 'src/features/marketMaker/controllers/marketMakerArchiveManyController';
import { marketMakerRestoreManyApiDoc } from 'src/features/marketMaker/controllers/marketMakerRestoreManyController';

export function marketMakerApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    marketMakerAutocompleteApiDoc,
    marketMakerCreateApiDoc,
    marketMakerArchiveManyApiDoc,
    marketMakerRestoreManyApiDoc,
    marketMakerDestroyManyApiDoc,
    marketMakerFindApiDoc,
    marketMakerFindManyApiDoc,
    marketMakerUpdateApiDoc,
    marketMakerImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['MarketMaker'],
      security,
    });
  });
}
