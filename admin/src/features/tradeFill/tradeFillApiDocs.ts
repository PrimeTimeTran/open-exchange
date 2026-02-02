import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { tradeFillAutocompleteApiDoc } from 'src/features/tradeFill/controllers/tradeFillAutocompleteController';
import { tradeFillCreateApiDoc } from 'src/features/tradeFill/controllers/tradeFillCreateController';
import { tradeFillDestroyManyApiDoc } from 'src/features/tradeFill/controllers/tradeFillDestroyManyController';
import { tradeFillFindApiDoc } from 'src/features/tradeFill/controllers/tradeFillFindController';
import { tradeFillFindManyApiDoc } from 'src/features/tradeFill/controllers/tradeFillFindManyController';
import { tradeFillImportApiDoc } from 'src/features/tradeFill/controllers/tradeFillImporterController';
import { tradeFillUpdateApiDoc } from 'src/features/tradeFill/controllers/tradeFillUpdateController';
import { tradeFillArchiveManyApiDoc } from 'src/features/tradeFill/controllers/tradeFillArchiveManyController';
import { tradeFillRestoreManyApiDoc } from 'src/features/tradeFill/controllers/tradeFillRestoreManyController';

export function tradeFillApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    tradeFillAutocompleteApiDoc,
    tradeFillCreateApiDoc,
    tradeFillArchiveManyApiDoc,
    tradeFillRestoreManyApiDoc,
    tradeFillDestroyManyApiDoc,
    tradeFillFindApiDoc,
    tradeFillFindManyApiDoc,
    tradeFillUpdateApiDoc,
    tradeFillImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['TradeFill'],
      security,
    });
  });
}
