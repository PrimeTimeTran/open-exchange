import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { postDestroyManyInputSchema } from 'src/features/post/postSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const postDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/post',
  request: {
    query: postDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function postDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.postDestroy,
    context,
  );

  const { ids } = postDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.post.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
