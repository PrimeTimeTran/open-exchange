import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import {
  articleUpdateBodyInputSchema,
  articleUpdateParamsInputSchema,
} from 'src/features/article/articleSchemas';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { prismaRelationship } from 'src/prisma/prismaRelationship';

export const articleUpdateApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/article/{id}',
  request: {
    params: articleUpdateParamsInputSchema,
    body: {
      content: {
        'application/json': {
          schema: articleUpdateBodyInputSchema,
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

export async function articleUpdateController(
  params: unknown,
  body: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.articleUpdate,
    context,
  );

  const { id } = articleUpdateParamsInputSchema.parse(params);

  const data = articleUpdateBodyInputSchema.parse(body);

  const prisma = prismaAuth(context);



  await prisma.article.update({
    where: {
      id_tenantId: {
        id,
        tenantId: currentTenant.id,
      },
    },
    data: {
      title: data.title,
      body: data.body,
      meta: data.meta,
      type: data.type,
      images: data.images,
      files: data.files,
      user: prismaRelationship.connectOrDisconnectOne(data.user),
    },
  });

  let article = await prisma.article.findUniqueOrThrow({
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
