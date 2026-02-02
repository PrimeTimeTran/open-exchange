import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { auditLogActivityChartApiDoc } from 'src/features/auditLog/controllers/auditLogActivityChartController';
import { auditLogFindManyApiDoc } from 'src/features/auditLog/controllers/auditLogFindManyController';

export function auditLogApiDocs(registry: OpenAPIRegistry, security: any) {
  [auditLogFindManyApiDoc, auditLogActivityChartApiDoc].map((apiDoc) => {
    registry.registerPath({
      ...apiDoc,
      tags: ['Audit Log'],
      security,
    });
  });
}
