import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { articleFindSchema } from 'src/features/article/articleSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const articleFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/article/{id}',
  request: {
    params: articleFindSchema,
  },
  responses: {
    200: {
      description: 'Article',
    },
  },
};

export async function articleFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.articleRead,
    context,
  );

  const { id } = articleFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let article = await prisma.article.findUnique({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
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
