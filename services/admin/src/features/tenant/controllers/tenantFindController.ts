import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { validateIsSignedInAndEmailVerified } from 'src/features/security';
import { tenantFindInputSchema } from 'src/features/tenant/tenantSchemas';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const tenantFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/tenant/{id}',
  request: {
    params: tenantFindInputSchema,
  },
  responses: {
    200: {
      description: 'Tenant',
    },
  },
};

export async function tenantFindController(
  params: unknown,
  context: AppContext,
) {
  validateIsSignedInAndEmailVerified(context);

  const { id } = tenantFindInputSchema.parse(params);

  const prisma = prismaDangerouslyBypassAuth(context);

  return await prisma.tenant.findUniqueOrThrow({
    where: {
      id,
    },
  });
}
