import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  userNotificationAutocompleteInputSchema,
  userNotificationAutocompleteOutputSchema,
} from 'src/features/userNotification/userNotificationSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const userNotificationAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/user-notification/autocomplete',
  request: {
    query: userNotificationAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(userNotificationAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function userNotificationAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.userNotificationAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    userNotificationAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.UserNotificationWhereInput> = [];

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

  let userNotifications = await prisma.userNotification.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return userNotifications.map((userNotification) => {
    return {
      id: userNotification.id,
    };
  });
}
