import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  userNotificationUpdateBodyInputSchema,
  userNotificationUpdateParamsInputSchema,
} from 'src/features/userNotification/userNotificationSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const userNotificationUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/user-notification/{id}',
  request: {
    params: userNotificationUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: userNotificationUpdateBodyInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'UserNotification',
    },
  },
};

export async function userNotificationUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.userNotificationUpdate,
    context,
  );

  const { id } = userNotificationUpdateParamsInputSchema.parse(params);

  const data = userNotificationUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.userNotification.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      readAt: data.readAt,
      dismissedAt: data.dismissedAt,
      acknowledgedAt: data.acknowledgedAt,
      deliveryChannel: data.deliveryChannel,
      deliveredAt: data.deliveredAt,
      meta: data.meta,
      notification: prismaRelationship.connectOrDisconnectOne(data.notification),
      user: prismaRelationship.connectOrDisconnectOne(data.user),
    },
  });

  let userNotification = await prisma.userNotification.findUniqueOrThrow({
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
