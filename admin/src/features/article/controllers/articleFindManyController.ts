import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import dayjs from 'dayjs';
import { articleFindManyInputSchema } from 'src/features/article/articleSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const articleFindManyApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/article',
  request: {
    query: articleFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ articles: Article[], count: number }',
    },
  },
};

export async function articleFindManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.articleRead,
    context,
  );

  const { filter, orderBy, skip, take } =
    articleFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.ArticleWhereInput> = [];

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

  let articles = await prisma.article.findMany({
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

  const count = await prisma.article.count({
    where: {
      AND: whereAnd,
    },
  });

  articles = await filePopulateDownloadUrlInTree(articles);

  return { articles, count };
}
