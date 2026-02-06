import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { notificationCreateInputSchema } from 'src/features/notification/notificationSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';


export const notificationCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/notification',
  request: {
    body: {
      content: {
        'application/json': {
          schema: notificationCreateInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Notification',
    },
  },
};

export async function notificationCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.notificationCreate, context);
  return await notificationCreate(body, context);
}

export async function notificationCreate(body: unknown, context: AppContext) {
  const data = notificationCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let notification = await prisma.notification.create({
    data: {
      type: data.type,
      severity: data.severity,
      title: data.title,
      body: data.body,
      actionUrl: data.actionUrl,
      scope: data.scope,
      targetUserId: data.targetUserId,
      targetSegment: data.targetSegment,
      persistent: data.persistent,
      dismissible: data.dismissible,
      requiresAck: data.requiresAck,
      meta: data.meta,
      importHash: data.importHash,
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
