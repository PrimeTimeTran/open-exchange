import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { userNotificationFindSchema } from 'src/features/userNotification/userNotificationSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const userNotificationFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/user-notification/{id}',
  request: {
    params: userNotificationFindSchema,
  },
  responses: {
    200: {
      description: 'UserNotification',
    },
  },
};

export async function userNotificationFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.userNotificationRead,
    context,
  );

  const { id } = userNotificationFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let userNotification = await prisma.userNotification.findUnique({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    include: {
      notification: true,
      user: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  userNotification = await filePopulateDownloadUrlInTree(userNotification);

  return userNotification;
}
