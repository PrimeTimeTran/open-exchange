import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { userNotificationRestoreManyInputSchema } from 'src/features/userNotification/userNotificationSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const userNotificationRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/user-notification/restore',
  request: {
    query: userNotificationRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function userNotificationRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.userNotificationRestore,
    context,
  );

  const { ids } = userNotificationRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.userNotification.updateMany({
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
