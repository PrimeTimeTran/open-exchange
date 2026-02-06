import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import {
  chateeAutocompleteInputSchema,
  chateeAutocompleteOutputSchema,
} from 'src/features/chatee/chateeSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { z } from 'zod';

export const chateeAutocompleteApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/chatee/autocomplete',
  request: {
    query: chateeAutocompleteInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': {
          schema: z.array(chateeAutocompleteOutputSchema),
        },
      },
    },
  },
};

export async function chateeAutocompleteController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.chateeAutocomplete,
    context,
  );

  const { search, exclude, take, orderBy } =
    chateeAutocompleteInputSchema.parse(query);

  const prisma = prismaAuth(context);

  const whereAnd: Array<Prisma.ChateeWhereInput> = [];

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

  let chatees = await prisma.chatee.findMany({
    where: {
      AND: whereAnd,
    },
    take,
    orderBy,
  });

  return chatees.map((chatee) => {
    return {
      id: chatee.id,
    };
  });
}
