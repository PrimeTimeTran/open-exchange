import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { apiKeyDestroyInputSchema } from 'src/features/apiKey/apiKeySchemas';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error403 from 'src/shared/errors/Error403';

export const apiKeyDestroyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/api-key/{id}',
  request: {
    params: apiKeyDestroyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function apiKeyDestroyController(
  params: unknown,
  context: AppContext,
) {
  const prisma = prismaAuth(context);

  const hasPermissionToDeleteForAllMembers = hasPermission(
    permissions.apiKeyDestroyAllMembers,
    context,
  );

  const { id } = apiKeyDestroyInputSchema.parse(params);

  if (hasPermissionToDeleteForAllMembers) {
    const { currentTenant } = context;

    return await prisma.apiKey.delete({
      where: {
        id_tenantId: {
          id,
          tenantId: currentTenant?.id as string,
        },
      },
    });
  }

  const hasPermissionToDelete = hasPermission(
    permissions.apiKeyDestroy,
    context,
  );

  if (hasPermissionToDelete) {
    const { currentTenant, currentMembership } = context;

    return await prisma.apiKey.delete({
      where: {
        id_tenantId_membershipId: {
          id,
          tenantId: currentTenant?.id as string,
          membershipId: currentMembership?.id as string,
        },
      },
    });
  }

  throw new Error403();
}
