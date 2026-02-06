import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  notificationAutocompleteInputSchema,
  notificationAutocompleteOutputSchema,
} from 'src/features/notification/notificationSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const notificationAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/notification/autocomplete',
  request: {
    query: notificationAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(notificationAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function notificationAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.notificationAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    notificationAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.NotificationWhereInput> = [];

  whereAnd.push({ tenantId: currentTenant.id });

  whereAnd.push({ archivedAt: null });

  if (exclude) {
    whereAnd.push({
      id: {
        notIn: exclude,
      },
    });
  }

  if (search) {
    whereAnd.push({
      id: search,
    });
  }

  let notifications = await prisma.notification.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return notifications.map((notification) => {
    return {
      id: notification.id,
    };
  });
}
