import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { feedbackDestroyManyInputSchema } from 'src/features/feedback/feedbackSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';
import Error400 from 'src/shared/errors/Error400';
import { formatTranslation } from 'src/translation/formatTranslation';

export const feedbackDestroyManyApiDoc: RouteConfig = {
  method: 'delete',
  path: '/api/feedback',
  request: {
    query: feedbackDestroyManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function feedbackDestroyManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.feedbackDestroy,
    context,
  );

  const { ids } = feedbackDestroyManyInputSchema.parse(query);

  const prisma = prismaAuth(context);



  return await prisma.feedback.deleteMany({
    where: {
      id: { in: ids },
      tenantId: currentTenant.id,
    },
  });
}
