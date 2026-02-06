import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { postAutocompleteApiDoc } from 'src/features/post/controllers/postAutocompleteController';
import { postCreateApiDoc } from 'src/features/post/controllers/postCreateController';
import { postDestroyManyApiDoc } from 'src/features/post/controllers/postDestroyManyController';
import { postFindApiDoc } from 'src/features/post/controllers/postFindController';
import { postFindManyApiDoc } from 'src/features/post/controllers/postFindManyController';
import { postImportApiDoc } from 'src/features/post/controllers/postImporterController';
import { postUpdateApiDoc } from 'src/features/post/controllers/postUpdateController';
import { postArchiveManyApiDoc } from 'src/features/post/controllers/postArchiveManyController';
import { postRestoreManyApiDoc } from 'src/features/post/controllers/postRestoreManyController';

export function postApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    postAutocompleteApiDoc,
    postCreateApiDoc,
    postArchiveManyApiDoc,
    postRestoreManyApiDoc,
    postDestroyManyApiDoc,
    postFindApiDoc,
    postFindManyApiDoc,
    postUpdateApiDoc,
    postImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Post'],
      security,
    });
  });
}
