import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { articleArchiveManyInputSchema as articleArchiveManyInputSchema } from 'src/features/article/articleSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const articleArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/article/archive',
  request: {
    query: articleArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function articleArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.articleArchive,
    context,
  );

  const { ids } = articleArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.article.updateMany({
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
