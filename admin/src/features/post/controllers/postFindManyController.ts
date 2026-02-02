import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { postFindManyInputSchema } from 'src/features/post/postSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const postFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/post',
  request: {
    query: postFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ posts: Post[], count: number }',
    },
  },
};

export async function postFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.postRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    postFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.PostWhereInput> = [];

  whereAnd.push({
    tenant: {
      id: currentTenant.id,
    },
  });

  if (filter?.archived !== true) {
    whereAnd.push({ archivedAt: null });
  }

  if (filter?.title != null) {
    whereAnd.push({
      title: { contains: filter?.title, mode: 'insensitive' },
    });
  }

  if (filter?.body != null) {
    whereAnd.push({
      body: { contains: filter?.body, mode: 'insensitive' },
    });
  }



  if (filter?.user != null) {
    whereAnd.push({
      user: {
        id: filter.user,
      },
    });
  }

  const prisma = prismaAuth(context);

  let posts = await prisma.post.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
    include: {
      user: true,
    }
  });

  const count = await prisma.post.count({
    where: {
      AND: whereAnd,
    },
  });

  posts = await filePopulateDownloadUrlInTree(posts);

  return { posts, count };
}
