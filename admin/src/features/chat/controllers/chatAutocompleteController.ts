import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  chatAutocompleteInputSchema,
  chatAutocompleteOutputSchema,
} from 'src/features/chat/chatSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const chatAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/chat/autocomplete',
  request: {
    query: chatAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(chatAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function chatAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.chatAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    chatAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.ChatWhereInput> = [];

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

  let chats = await prisma.chat.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return chats.map((chat) => {
    return {
      id: chat.id,
    };
  });
}
