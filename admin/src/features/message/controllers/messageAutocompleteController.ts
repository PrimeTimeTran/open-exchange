import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  messageAutocompleteInputSchema,
  messageAutocompleteOutputSchema,
} from 'src/features/message/messageSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const messageAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/message/autocomplete',
  request: {
    query: messageAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(messageAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function messageAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.messageAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    messageAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.MessageWhereInput> = [];

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

  let messages = await prisma.message.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return messages.map((message) => {
    return {
      id: message.id,
    };
  });
}
