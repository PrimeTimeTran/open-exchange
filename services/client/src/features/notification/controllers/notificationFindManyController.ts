import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { notificationFindManyInputSchema } from 'src/features/notification/notificationSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const notificationFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/notification',
  request: {
    query: notificationFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ notifications: Notification[], count: number }',
    },
  },
};

export async function notificationFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.notificationRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    notificationFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.NotificationWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant.id,
    },
  });

  if (filter?.archived !== true) {
    whereAnd.push({ archivedAt: null });
  }

  if (filter?.type != null) {
    whereAnd.push({
      type: filter?.type,
    });
  }

  if (filter?.severity != null) {
    whereAnd.push({
      severity: filter?.severity,
    });
  }

  if (filter?.title != null) {
    whereAnd.push({
      title: { contains: filter?.title, mode: 'insensitive' },
    });
  }

  if (filter?.body != null) {
    whereAnd.push({
      body: { contains: filter?.body, mode: 'insensitive' },
    });
  }

  if (filter?.actionUrl != null) {
    whereAnd.push({
      actionUrl: { contains: filter?.actionUrl, mode: 'insensitive' },
    });
  }

  if (filter?.scope != null) {
    whereAnd.push({
      scope: filter?.scope,
    });
  }

  if (filter?.targetUserId != null) {
    whereAnd.push({
      targetUserId: { contains: filter?.targetUserId, mode: 'insensitive' },
    });
  }

  if (filter?.targetSegment != null) {
    whereAnd.push({
      targetSegment: { contains: filter?.targetSegment, mode: 'insensitive' },
    });
  }

  if (filter?.persistent != null) {
    whereAnd.push({
      persistent: filter.persistent,
    });
  }

  if (filter?.dismissible != null) {
    whereAnd.push({
      dismissible: filter.dismissible,
    });
  }

  if (filter?.requiresAck != null) {
    whereAnd.push({
      requiresAck: filter.requiresAck,
    });
  }

  const prisma = prismaAuth(context);

  let notifications = await prisma.notification.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.notification.count({
    where: {
      AND: whereAnd,
    },
  });

  notifications = await filePopulateDownloadUrlInTree(notifications);

  return { notifications, count };
}
