import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { articleRestoreManyInputSchema } from 'src/features/article/articleSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const articleRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/article/restore',
  request: {
    query: articleRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function articleRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.articleRestore,
    context,
  );

  const { ids } = articleRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.article.updateMany({
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
