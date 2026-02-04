import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { tenantDestroyInputSchema } from 'src/features/tenant/tenantSchemas';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error403 from 'src/shared/errors/Error403';

export const tenantDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/tenant/{id}',
  request: {
    params: tenantDestroyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function tenantDestroyController(
  params: unknown,
  context: AppContext,
) {
  if (process.env.NEXT_PUBLIC_TENANT_MODE !== 'multi') {
    throw new Error403();
  }

  const prisma = prismaDangerouslyBypassAuth(context);

  const { id } = tenantDestroyInputSchema.parse(params);

  const currentTenant = await prisma.tenant.findUniqueOrThrow({
    where: { id },
  });

  validateHasPermission(permissions.tenantDestroy, {
    ...context,
    currentTenant,
  });

  await prisma.tenant.delete({
    where: {
      id: id,
    },
  });
}
