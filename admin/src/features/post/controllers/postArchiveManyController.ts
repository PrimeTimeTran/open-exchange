import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { postArchiveManyInputSchema as postArchiveManyInputSchema } from 'src/features/post/postSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const postArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/post/archive',
  request: {
    query: postArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function postArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.postArchive,
    context,
  );

  const { ids } = postArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.post.updateMany({
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
