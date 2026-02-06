import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { roles } from 'src/features/roles';
import { validateIsSignedInAndEmailVerified } from 'src/features/security';
import { tenantCreateInputSchema } from 'src/features/tenant/tenantSchemas';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error403 from 'src/shared/errors/Error403';

export const tenantCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/tenant',
  request: {
    body: {
      content: {
        'application/json': {
          schema: tenantCreateInputSchema,
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

export async function tenantCreateController(
  body: unknown,
  context: AppContext,
) {
  if (process.env.NEXT_PUBLIC_TENANT_MODE !== 'multi') {
    throw new Error403();
  }

  validateIsSignedInAndEmailVerified(context);

  const data = tenantCreateInputSchema.parse(body);

  if (!context.currentUser) {
    throw new Error403();
  }

  const prisma = prismaDangerouslyBypassAuth(context);

  const tenant = await prisma.tenant.create({
    data: {
      name: data.name,
      memberships: {
        create: {
          userId: context.currentUser.id,
          roles: [roles.admin],
        },
      },
    },
  });

  return tenant;
}
