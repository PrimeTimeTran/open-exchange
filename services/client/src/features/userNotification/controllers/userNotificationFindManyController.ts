import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { userNotificationFindManyInputSchema } from 'src/features/userNotification/userNotificationSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const userNotificationFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/user-notification',
  request: {
    query: userNotificationFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ userNotifications: UserNotification[], count: number }',
    },
  },
};

export async function userNotificationFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.userNotificationRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    userNotificationFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.UserNotificationWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant.id,
    },
  });

  if (filter?.archived !== true) {
    whereAnd.push({ archivedAt: null });
  }

  if (filter?.readAtRange?.length) {
    const start = filter.readAtRange?.[0];
    const end = filter.readAtRange?.[1];

    if (start != null) {
      whereAnd.push({
        readAt: {
          gte: start,
        },
      });
    }

    if (end != null) {
      whereAnd.push({
        readAt: {
          lte: end,
        },
      });
    }
  }

  if (filter?.dismissedAtRange?.length) {
    const start = filter.dismissedAtRange?.[0];
    const end = filter.dismissedAtRange?.[1];

    if (start != null) {
      whereAnd.push({
        dismissedAt: {
          gte: start,
        },
      });
    }

    if (end != null) {
      whereAnd.push({
        dismissedAt: {
          lte: end,
        },
      });
    }
  }

  if (filter?.acknowledgedAtRange?.length) {
    const start = filter.acknowledgedAtRange?.[0];
    const end = filter.acknowledgedAtRange?.[1];

    if (start != null) {
      whereAnd.push({
        acknowledgedAt: {
          gte: start,
        },
      });
    }

    if (end != null) {
      whereAnd.push({
        acknowledgedAt: {
          lte: end,
        },
      });
    }
  }

  if (filter?.deliveryChannel != null) {
    whereAnd.push({
      deliveryChannel: filter?.deliveryChannel,
    });
  }

  if (filter?.deliveredAtRange?.length) {
    const start = filter.deliveredAtRange?.[0];
    const end = filter.deliveredAtRange?.[1];

    if (start != null) {
      whereAnd.push({
        deliveredAt: {
          gte: start,
        },
      });
    }

    if (end != null) {
      whereAnd.push({
        deliveredAt: {
          lte: end,
        },
      });
    }
  }

  const prisma = prismaAuth(context);

  let userNotifications = await prisma.userNotification.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.userNotification.count({
    where: {
      AND: whereAnd,
    },
  });

  userNotifications = await filePopulateDownloadUrlInTree(userNotifications);

  return { userNotifications, count };
}
