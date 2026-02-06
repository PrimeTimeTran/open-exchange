import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { chaterFindManyInputSchema } from 'src/features/chater/chaterSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const chaterFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/chater',
  request: {
    query: chaterFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ chaters: Chater[], count: number }',
    },
  },
};

export async function chaterFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.chaterRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    chaterFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.ChaterWhereInput> = [];

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

  let chaters = await prisma.chater.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
  });

  const count = await prisma.chater.count({
    where: {
      AND: whereAnd,
    },
  });

  chaters = await filePopulateDownloadUrlInTree(chaters);

  return { chaters, count };
}
