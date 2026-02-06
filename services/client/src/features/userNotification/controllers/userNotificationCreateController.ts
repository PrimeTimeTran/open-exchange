import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { userNotificationCreateInputSchema } from 'src/features/userNotification/userNotificationSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const userNotificationCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/user-notification',
  request: {
    body: {
      content: {
        'application/json': {
          schema: userNotificationCreateInputSchema,
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

export async function userNotificationCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.userNotificationCreate, context);
  return await userNotificationCreate(body, context);
}

export async function userNotificationCreate(body: unknown, context: AppContext) {
  const data = userNotificationCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let userNotification = await prisma.userNotification.create({
    data: {
      readAt: data.readAt,
      dismissedAt: data.dismissedAt,
      acknowledgedAt: data.acknowledgedAt,
      deliveryChannel: data.deliveryChannel,
      deliveredAt: data.deliveredAt,
      meta: data.meta,
      notification: prismaRelationship.connectOne(data.notification),
      user: prismaRelationship.connectOne(data.user),
      importHash: data.importHash,
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
