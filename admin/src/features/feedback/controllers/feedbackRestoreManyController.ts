import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { feedbackRestoreManyInputSchema } from 'src/features/feedback/feedbackSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const feedbackRestoreManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/feedback/restore',
  request: {
    query: feedbackRestoreManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function feedbackRestoreManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.feedbackRestore,
    context,
  );

  const { ids } = feedbackRestoreManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.feedback.updateMany({
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
