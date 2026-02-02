import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { commentArchiveManyInputSchema as commentArchiveManyInputSchema } from 'src/features/comment/commentSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const commentArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/comment/archive',
  request: {
    query: commentArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function commentArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.commentArchive,
    context,
  );

  const { ids } = commentArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.comment.updateMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
    data: {
      archivedAt: new Date(),
      archivedByMembershipId: context.currentMembership!.id,
    },
  });
}
