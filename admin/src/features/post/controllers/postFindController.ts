import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { postFindSchema } from 'src/features/post/postSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const postFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/post/{id}',
  request: {
    params: postFindSchema,
  },
  responses: {
    200: {
      description: 'Post',
    },
  },
};

export async function postFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.postRead,
    context,
  );

  const { id } = postFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let post = await prisma.post.findUnique({
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

  post = await filePopulateDownloadUrlInTree(post);

  return post;
}
