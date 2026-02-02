import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { postRestoreManyInputSchema } from 'src/features/post/postSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const postRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/post/restore',
  request: {
    query: postRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function postRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.postRestore,
    context,
  );

  const { ids } = postRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.post.updateMany({
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
