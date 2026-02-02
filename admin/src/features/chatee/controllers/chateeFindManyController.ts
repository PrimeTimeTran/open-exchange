import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { chateeFindManyInputSchema } from 'src/features/chatee/chateeSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const chateeFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/chatee',
  request: {
    query: chateeFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ chatees: Chatee[], count: number }',
    },
  },
};

export async function chateeFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.chateeRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    chateeFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.ChateeWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant.id,
    },
  });

  if (filter?.archived !== true) {
    whereAnd.push({ archivedAt: null });
  }

  if (filter?.nickname != null) {
    whereAnd.push({
      nickname: { contains: filter?.nickname, mode: 'insensitive' },
    });
  }

  if (filter?.status != null) {
    whereAnd.push({
      status: filter?.status,
    });
  }



  const prisma = prismaAuth(context);

  let chatees = await prisma.chatee.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.chatee.count({
    where: {
      AND: whereAnd,
    },
  });

  chatees = await filePopulateDownloadUrlInTree(chatees);

  return { chatees, count };
}
