import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { commentFindSchema } from 'src/features/comment/commentSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import { filePopulateDownloadUrlInTree } from 'src/features/file/fileService';

export const commentFindApiDoc: RouteConfig = {
  method: 'get',
  path: '/api/comment/{id}',
  request: {
    params: commentFindSchema,
  },
  responses: {
    200: {
      description: 'Comment',
    },
  },
};

export async function commentFindController(
  params: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.commentRead,
    context,
  );

  const { id } = commentFindSchema.parse(params);

  const prisma = prismaAuth(context);

  let comment = await prisma.comment.findUnique({
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

  comment = await filePopulateDownloadUrlInTree(comment);

  return comment;
}
