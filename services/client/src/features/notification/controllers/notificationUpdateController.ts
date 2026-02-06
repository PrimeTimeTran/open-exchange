import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  notificationUpdateBodyInputSchema,
  notificationUpdateParamsInputSchema,
} from 'src/features/notification/notificationSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';


export const notificationUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/notification/{id}',
  request: {
    params: notificationUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: notificationUpdateBodyInputSchema,
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

export async function notificationUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.notificationUpdate,
    context,
  );

  const { id } = notificationUpdateParamsInputSchema.parse(params);

  const data = notificationUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.notification.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
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
    },
  });

  let notification = await prisma.notification.findUniqueOrThrow({
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
