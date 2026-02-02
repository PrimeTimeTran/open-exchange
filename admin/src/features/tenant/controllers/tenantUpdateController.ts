import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import {
  tenantUpdateInputSchema,
  tenantUpdateParamsInputSchema,
} from 'src/features/tenant/tenantSchemas';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error403 from 'src/shared/errors/Error403';

export const tenantUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/tenant/{id}',
  request: {
    params: tenantUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: tenantUpdateInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Tenant',
    },
  },
};

export async function tenantUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  if (process.env.NEXT_PUBLIC_TENANT_MODE !== 'multi') {
    throw new Error403();
  }

  const prisma = prismaDangerouslyBypassAuth(context);

  const { id } = tenantUpdateParamsInputSchema.parse(params);
  const data = tenantUpdateInputSchema.parse(body);
  const currentTenant = await prisma.tenant.findUniqueOrThrow({
    where: { id },
  });

  validateHasPermission(permissions.tenantEdit, { ...context, currentTenant });

  const tenant = await prisma.tenant.update({
    where: {
      id: id,
    },
    data: {
      name: data.name,
    },
  });

  return tenant;
}
