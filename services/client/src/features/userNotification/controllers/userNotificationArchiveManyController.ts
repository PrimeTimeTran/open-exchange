import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { userNotificationArchiveManyInputSchema as userNotificationArchiveManyInputSchema } from 'src/features/userNotification/userNotificationSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const userNotificationArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/user-notification/archive',
  request: {
    query: userNotificationArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function userNotificationArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.userNotificationArchive,
    context,
  );

  const { ids } = userNotificationArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.userNotification.updateMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
    data: {
      archivedAt: new Date(),
      archivedByMembershipId: context.currentMembership!.id,
    },
  });
}
