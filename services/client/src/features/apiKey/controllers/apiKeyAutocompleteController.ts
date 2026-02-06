import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  apiKeyAutocompleteInputSchema,
  apiKeyAutocompleteOutputSchema,
} from 'src/features/apiKey/apiKeySchemas';
import { permissions } from 'src/features/permissions';
import { hasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error403 from 'src/shared/errors/Error403';
import { z } from 'zod';

export const apiKeyAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/api-key/autocomplete',
  request: {
    query: apiKeyAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: apiKeyAutocompleteOutputSchema,
        },
      },
    },
  },
};

export async function apiKeyAutocompleteController(
  query: unknown,
  context: AppContext,
): Promise<z.infer<typeof apiKeyAutocompleteOutputSchema>> {
  const { currentTenant, currentMembership } = context;
  const hasPermissionToRead = hasPermission(permissions.apiKeyRead, context);
  const hasPermissionToReadFromAllMembers = hasPermission(
    permissions.apiKeyReadAllMembers,
    context,
  );

  if (!hasPermissionToRead && !hasPermissionToReadFromAllMembers) {
    throw new Error403();
  }

  const { search, exclude, take, orderBy } =
    apiKeyAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.ApiKeyWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant?.id,
    },
  });

  if (!hasPermissionToReadFromAllMembers) {
    whereAnd.push({
      membership: {
        id: currentMembership?.id,
      },
    });
  }

  if (exclude) {
    whereAnd.push({
      id: {
        notIn: exclude,
      },
    });
  }

  whereAnd.push({
    OR: [
      {
        name: { contains: search, mode: 'insensitive' },
      },
      {
        keyPrefix: { contains: search, mode: 'insensitive' },
      },
    ],
  });

  let apiKeys = await prisma.apiKey.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
    include: {
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

  return apiKeys.map((apiKey) => {
    return {
      id: apiKey.id,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      email: apiKey?.membership?.user?.email,
      fullName: apiKey?.membership?.fullName,
    };
  });
}
