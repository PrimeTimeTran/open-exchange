import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { articleAutocompleteApiDoc } from 'src/features/article/controllers/articleAutocompleteController';
import { articleCreateApiDoc } from 'src/features/article/controllers/articleCreateController';
import { articleDestroyManyApiDoc } from 'src/features/article/controllers/articleDestroyManyController';
import { articleFindApiDoc } from 'src/features/article/controllers/articleFindController';
import { articleFindManyApiDoc } from 'src/features/article/controllers/articleFindManyController';
import { articleImportApiDoc } from 'src/features/article/controllers/articleImporterController';
import { articleUpdateApiDoc } from 'src/features/article/controllers/articleUpdateController';
import { articleArchiveManyApiDoc } from 'src/features/article/controllers/articleArchiveManyController';
import { articleRestoreManyApiDoc } from 'src/features/article/controllers/articleRestoreManyController';

export function articleApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    articleAutocompleteApiDoc,
    articleCreateApiDoc,
    articleArchiveManyApiDoc,
    articleRestoreManyApiDoc,
    articleDestroyManyApiDoc,
    articleFindApiDoc,
    articleFindManyApiDoc,
    articleUpdateApiDoc,
    articleImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Article'],
      security,
    });
  });
}
