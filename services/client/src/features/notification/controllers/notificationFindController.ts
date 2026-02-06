import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { notificationFindSchema } from 'src/features/notification/notificationSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const notificationFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/notification/{id}',
  request: {
    params: notificationFindSchema,
  },
  responses: {
    200: {
      description: 'Notification',
    },
  },
};

export async function notificationFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.notificationRead,
    context,
  );

  const { id } = notificationFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let notification = await prisma.notification.findUnique({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    include: {
      userNotifications: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  notification = await filePopulateDownloadUrlInTree(notification);

  return notification;
}
