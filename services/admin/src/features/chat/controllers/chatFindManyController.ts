import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { chatFindManyInputSchema } from 'src/features/chat/chatSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const chatFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/chat',
  request: {
    query: chatFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ chats: Chat[], count: number }',
    },
  },
};

export async function chatFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.chatRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    chatFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.ChatWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant.id,
    },
  });

  if (filter?.archived !== true) {
    whereAnd.push({ archivedAt: null });
  }

  if (filter?.name != null) {
    whereAnd.push({
      name: { contains: filter?.name, mode: 'insensitive' },
    });
  }

  if (filter?.active != null) {
    whereAnd.push({
      active: filter.active,
    });
  }

  const prisma = prismaAuth(context);

  let chats = await prisma.chat.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.chat.count({
    where: {
      AND: whereAnd,
    },
  });

  chats = await filePopulateDownloadUrlInTree(chats);

  return { chats, count };
}
