import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { feedbackArchiveManyInputSchema as feedbackArchiveManyInputSchema } from 'src/features/feedback/feedbackSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const feedbackArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/feedback/archive',
  request: {
    query: feedbackArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function feedbackArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.feedbackArchive,
    context,
  );

  const { ids } = feedbackArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.feedback.updateMany({
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
