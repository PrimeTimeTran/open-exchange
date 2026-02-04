import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { assetAutocompleteApiDoc } from 'src/features/asset/controllers/assetAutocompleteController';
import { assetCreateApiDoc } from 'src/features/asset/controllers/assetCreateController';
import { assetDestroyManyApiDoc } from 'src/features/asset/controllers/assetDestroyManyController';
import { assetFindApiDoc } from 'src/features/asset/controllers/assetFindController';
import { assetFindManyApiDoc } from 'src/features/asset/controllers/assetFindManyController';
import { assetImportApiDoc } from 'src/features/asset/controllers/assetImporterController';
import { assetUpdateApiDoc } from 'src/features/asset/controllers/assetUpdateController';
import { assetArchiveManyApiDoc } from 'src/features/asset/controllers/assetArchiveManyController';
import { assetRestoreManyApiDoc } from 'src/features/asset/controllers/assetRestoreManyController';

export function assetApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    assetAutocompleteApiDoc,
    assetCreateApiDoc,
    assetArchiveManyApiDoc,
    assetRestoreManyApiDoc,
    assetDestroyManyApiDoc,
    assetFindApiDoc,
    assetFindManyApiDoc,
    assetUpdateApiDoc,
    assetImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Asset'],
      security,
    });
  });
}
