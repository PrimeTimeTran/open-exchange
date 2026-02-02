import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { articleCreateInputSchema } from 'src/features/article/articleSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const articleCreateApiDoc: RouteConfig = {
  method: 'post',
  path: '/api/article',
  request: {
    body: {
      content: {
        'application/json': {
          schema: articleCreateInputSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Article',
    },
  },
};

export async function articleCreateController(
  body: unknown,
  context: AppContext,
) {
  validateHasPermission(permissions.articleCreate, context);
  return await articleCreate(body, context);
}

export async function articleCreate(body: unknown, context: AppContext) {
  const data = articleCreateInputSchema.parse(body);

  const prisma = prismaAuth(context);



  let article = await prisma.article.create({
    data: {
      title: data.title,
      body: data.body,
      meta: data.meta,
      type: data.type,
      images: data.images,
      files: data.files,
      user: prismaRelationship.connectOne(data.user),
      importHash: data.importHash,
    },
    include: {
      user: true,
      createdByMembership: true,
      updatedByMembership: true,
      archivedByMembership: true,
    },
  });

  article = await filePopulateDownloadUrlInTree(article);

  return article;
}
