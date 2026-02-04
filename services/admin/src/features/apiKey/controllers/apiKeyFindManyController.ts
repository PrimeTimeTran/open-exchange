import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import { apiKeyFindManyInputSchema } from 'src/features/apiKey/apiKeySchemas';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error403 from 'src/shared/errors/Error403';

export const apiKeyFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/api-key',
  request: {
    query: apiKeyFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ apiKeys: ApiKey[], count: number }',
    },
  },
};

export async function apiKeyFindManyController(
  query: unknown,
  context: AppContext,
) {
  const prisma = prismaAuth(context);

  const hasPermissionToRead = hasPermission(permissions.apiKeyRead, context);
  const hasPermissionToReadFromAllMembers = hasPermission(
    permissions.apiKeyReadAllMembers,
    context,
  );

  if (!hasPermissionToRead && !hasPermissionToReadFromAllMembers) {
    throw new Error403();
  }

  const { currentTenant, currentMembership } = context;

  let { filter, orderBy, skip, take } = apiKeyFindManyInputSchema.parse(query);

  if (orderBy?.['membership_user.email']) {
    orderBy = {
      membership: {
        user: {
          email: orderBy['membership_user.email'] === 'asc' ? 'asc' : 'desc',
        },
      },
    };
  }

  const whereAnd: Array<Prisma.ApiKeyWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant?.id,
    },
  });

  if (filter?.id) {
    whereAnd.push({
      id: filter.id,
    });
  }

  if (filter?.membership) {
    whereAnd.push({
      membership: {
        id: filter.membership,
      },
    });
  }

  if (!hasPermissionToReadFromAllMembers) {
    whereAnd.push({
      membership: {
        id: currentMembership?.id,
      },
    });
  }
  const apiKeys = await prisma.apiKey.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      scopes: true,
      expiresAt: true,
      disabledAt: true,
      createdAt: true,
      membership: {
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  });

  const count = await prisma.apiKey.count({
    where: {
      AND: whereAnd,
    },
  });

  return { apiKeys, count };
}
