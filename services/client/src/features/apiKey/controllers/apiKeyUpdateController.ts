import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  apiKeyUpdateInputSchema,
  apiKeyUpdateParamsSchema,
} from 'src/features/apiKey/apiKeySchemas';
import { permissions } from 'src/features/permissions';
import { allowedPermissions, hasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error403 from 'src/shared/errors/Error403';
import Error404 from 'src/shared/errors/Error404';

export const apiKeyUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/api-key/{id}',
  request: {
    params: apiKeyUpdateParamsSchema,
    body: {
      content: {
        'application/json': {
          schema: apiKeyUpdateInputSchema(),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function apiKeyUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const hasPermissionApiUpdate = hasPermission(
    permissions.apiKeyUpdate,
    context,
  );

  const hasPermissionApiUpdateForAllMembers = hasPermission(
    permissions.apiKeyUpdateAllMembers,
    context,
  );

  const { id } = apiKeyUpdateParamsSchema.parse(params);

  if (!hasPermissionApiUpdate && !hasPermissionApiUpdateForAllMembers) {
    throw new Error403();
  }

  const { currentTenant } = context;

  const prisma = prismaAuth(context);
  const apiKey = await prisma.apiKey.findUnique({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant?.id as string,
      },
    },
    include: {
      membership: true,
    },
  });

  if (!apiKey) {
    throw new Error404();
  }

  if (!hasPermissionApiUpdateForAllMembers) {
    if (apiKey.membership.id !== context.currentMembership?.id) {
      throw new Error403();
    }
  }

  const availableScopes = allowedPermissions(apiKey.membership.roles).map(
    (p) => p.id,
  );

  const apiKeyUpdateSchema = apiKeyUpdateInputSchema(
    availableScopes,
    context.dictionary,
  ).partial();

  const data = apiKeyUpdateSchema.parse(body);

  await prisma.apiKey.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant?.id as string,
      },
    },
    data: {
      name: data.name,
      scopes: data.scopes,
      expiresAt: data.expiresAt,
      disabledAt:
        data.disabled == undefined
          ? undefined
          : data.disabled
          ? new Date()
          : null,
    },
  });
}
