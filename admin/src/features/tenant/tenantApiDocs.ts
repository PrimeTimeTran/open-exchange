import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { tenantCreateApiDoc } from 'src/features/tenant/controllers/tenantCreateController';
import { tenantDestroyManyApiDoc } from 'src/features/tenant/controllers/tenantDestroyController';
import { tenantFindApiDoc } from 'src/features/tenant/controllers/tenantFindController';
import { tenantFindManyApiDoc } from 'src/features/tenant/controllers/tenantFindManyController';
import { tenantUpdateApiDoc } from 'src/features/tenant/controllers/tenantUpdateController';

export function tenantApiDocs(registry: OpenAPIRegistry, security: any) {
  [
    tenantCreateApiDoc,
    tenantDestroyManyApiDoc,
    tenantFindApiDoc,
    tenantFindManyApiDoc,
    tenantUpdateApiDoc,
  ].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Tenant'],
      security,
    });
  });
}
