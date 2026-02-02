import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { messageFindManyInputSchema } from 'src/features/message/messageSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const messageFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/message',
  request: {
    query: messageFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ messages: Message[], count: number }',
    },
  },
};

export async function messageFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.messageRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    messageFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.MessageWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant.id,
    },
  });

  if (filter?.archived !== true) {
    whereAnd.push({ archivedAt: null });
  }

  if (filter?.body != null) {
    whereAnd.push({
      body: { contains: filter?.body, mode: 'insensitive' },
    });
  }



  const prisma = prismaAuth(context);

  let messages = await prisma.message.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.message.count({
    where: {
      AND: whereAnd,
    },
  });

  messages = await filePopulateDownloadUrlInTree(messages);

  return { messages, count };
}
