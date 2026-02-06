import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { notificationRestoreManyInputSchema } from 'src/features/notification/notificationSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const notificationRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/notification/restore',
  request: {
    query: notificationRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function notificationRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.notificationRestore,
    context,
  );

  const { ids } = notificationRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.notification.updateMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
    data: {
      archivedAt: null,
      archivedByMembershipId: null,
    },
  });
}
