import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { listingAutocompleteApiDoc } from 'src/features/listing/controllers/listingAutocompleteController';
import { listingCreateApiDoc } from 'src/features/listing/controllers/listingCreateController';
import { listingDestroyManyApiDoc } from 'src/features/listing/controllers/listingDestroyManyController';
import { listingFindApiDoc } from 'src/features/listing/controllers/listingFindController';
import { listingFindManyApiDoc } from 'src/features/listing/controllers/listingFindManyController';
import { listingImportApiDoc } from 'src/features/listing/controllers/listingImporterController';
import { listingUpdateApiDoc } from 'src/features/listing/controllers/listingUpdateController';
import { listingArchiveManyApiDoc } from 'src/features/listing/controllers/listingArchiveManyController';
import { listingRestoreManyApiDoc } from 'src/features/listing/controllers/listingRestoreManyController';

export function listingApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    listingAutocompleteApiDoc,
    listingCreateApiDoc,
    listingArchiveManyApiDoc,
    listingRestoreManyApiDoc,
    listingDestroyManyApiDoc,
    listingFindApiDoc,
    listingFindManyApiDoc,
    listingUpdateApiDoc,
    listingImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Listing'],
      security,
    });
  });
}
