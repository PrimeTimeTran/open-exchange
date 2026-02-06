import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { orderAutocompleteApiDoc } from 'src/features/order/controllers/orderAutocompleteController';
import { orderCreateApiDoc } from 'src/features/order/controllers/orderCreateController';
import { orderDestroyManyApiDoc } from 'src/features/order/controllers/orderDestroyManyController';
import { orderFindApiDoc } from 'src/features/order/controllers/orderFindController';
import { orderFindManyApiDoc } from 'src/features/order/controllers/orderFindManyController';
import { orderImportApiDoc } from 'src/features/order/controllers/orderImporterController';
import { orderUpdateApiDoc } from 'src/features/order/controllers/orderUpdateController';
import { orderArchiveManyApiDoc } from 'src/features/order/controllers/orderArchiveManyController';
import { orderRestoreManyApiDoc } from 'src/features/order/controllers/orderRestoreManyController';

export function orderApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    orderAutocompleteApiDoc,
    orderCreateApiDoc,
    orderArchiveManyApiDoc,
    orderRestoreManyApiDoc,
    orderDestroyManyApiDoc,
    orderFindApiDoc,
    orderFindManyApiDoc,
    orderUpdateApiDoc,
    orderImportApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Order'],
      security,
    });
  });
}
