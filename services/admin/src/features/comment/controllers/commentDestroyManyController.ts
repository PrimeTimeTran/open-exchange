import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { commentDestroyManyInputSchema } from 'src/features/comment/commentSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const commentDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/comment',
  request: {
    query: commentDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function commentDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.commentDestroy,
    context,
  );

  const { ids } = commentDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.comment.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
