import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { itemAutocompleteApiDoc } from 'src/features/item/controllers/itemAutocompleteController';
import { itemCreateApiDoc } from 'src/features/item/controllers/itemCreateController';
import { itemDestroyManyApiDoc } from 'src/features/item/controllers/itemDestroyManyController';
import { itemFindApiDoc } from 'src/features/item/controllers/itemFindController';
import { itemFindManyApiDoc } from 'src/features/item/controllers/itemFindManyController';
import { itemImportApiDoc } from 'src/features/item/controllers/itemImporterController';
import { itemUpdateApiDoc } from 'src/features/item/controllers/itemUpdateController';
import { itemArchiveManyApiDoc } from 'src/features/item/controllers/itemArchiveManyController';
import { itemRestoreManyApiDoc } from 'src/features/item/controllers/itemRestoreManyController';

export function itemApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    itemAutocompleteApiDoc,
    itemCreateApiDoc,
    itemArchiveManyApiDoc,
    itemRestoreManyApiDoc,
    itemDestroyManyApiDoc,
    itemFindApiDoc,
    itemFindManyApiDoc,
    itemUpdateApiDoc,
    itemImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Item'],
      security,
    });
  });
}
