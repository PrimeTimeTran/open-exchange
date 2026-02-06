import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { commentRestoreManyInputSchema } from 'src/features/comment/commentSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const commentRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/comment/restore',
  request: {
    query: commentRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function commentRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.commentRestore,
    context,
  );

  const { ids } = commentRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.comment.updateMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
    data: {
      archivedAt: null,
      archivedByMembershipId: null,
    },
  });
}
