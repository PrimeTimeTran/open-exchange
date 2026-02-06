import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { notificationArchiveManyInputSchema as notificationArchiveManyInputSchema } from 'src/features/notification/notificationSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const notificationArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/notification/archive',
  request: {
    query: notificationArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function notificationArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.notificationArchive,
    context,
  );

  const { ids } = notificationArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.notification.updateMany({
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
