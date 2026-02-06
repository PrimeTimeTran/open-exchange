import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { Prisma } from '@prisma/client';
import { postFindManyInputSchema } from 'src/features/post/postSchemas';
import { prismaDangerouslyBypassAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const postFindManyPublicApiDoc: RouteConfig = {
  method: 'get',
  path: '/api',
  request: {
    query: postFindManyInputSchema,
  },
  responses: {
    200: {
      description: '{ posts: Post[], count: number }',
    },
  },
};

export async function postFindManyPublicController(
  query: unknown,
  context: AppContext,
) {
  const { filter, orderBy, skip, take } = postFindManyInputSchema.parse(query);

  const whereAnd: Array<Prisma.PostWhereInput> = [];

  // Filter by tenant if provided in query (bypassing schema which doesn't include it)
  // or use context tenant if available
  const queryObj = query as any;
  if (queryObj?.tenantId) {
    whereAnd.push({
      tenant: {
        id: queryObj.tenantId,
      },
    });
  } else if (context.currentTenant) {
    whereAnd.push({
      tenant: {
        id: context.currentTenant.id,
      },
    });
  }

  // Always filter out archived posts for public
  whereAnd.push({ archivedAt: null });

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

  const prisma = prismaDangerouslyBypassAuth(context);

  let posts = await prisma.post.findMany({
    where: {
      AND: whereAnd,
    },
    skip,
    take,
    orderBy,
    include: {
      user: true,
    },
  });

  const count = await prisma.post.count({
    where: {
      AND: whereAnd,
    },
  });

  posts = await filePopulateDownloadUrlInTree(posts);

  return { posts, count };
}
