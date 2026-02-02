import { RouteConfig } from '@asteasolutions/zod-to-openapi';
import { tradeFillArchiveManyInputSchema as tradeFillArchiveManyInputSchema } from 'src/features/tradeFill/tradeFillSchemas';
import { permissions } from 'src/features/permissions';
import { validateHasPermission } from 'src/features/security';
import { prismaAuth } from 'src/prisma';
import { AppContext } from 'src/shared/controller/appContext';

export const tradeFillArchiveManyApiDoc: RouteConfig = {
  method: 'put',
  path: '/api/trade-fill/archive',
  request: {
    query: tradeFillArchiveManyInputSchema,
  },
  responses: {
    200: {
      description: 'OK',
    },
  },
};

export async function tradeFillArchiveManyController(
  query: unknown,
  context: AppContext,
) {
  const { currentTenant } = validateHasPermission(
    permissions.tradeFillArchive,
    context,
  );

  const { ids } = tradeFillArchiveManyInputSchema.parse(query);

  const prisma = prismaAuth(context);

  return await prisma.tradeFill.updateMany({
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
