import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { articleDestroyManyInputSchema } from 'src/features/article/articleSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const articleDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/article',
  request: {
    query: articleDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function articleDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.articleDestroy,
    context,
  );

  const { ids } = articleDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.article.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
